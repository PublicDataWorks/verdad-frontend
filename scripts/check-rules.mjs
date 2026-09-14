#!/usr/bin/env node
// Validate .claude/rules/*.md: each rule needs YAML frontmatter with a `paths:` list of globs,
// and every glob must match at least one git-tracked file. A stale glob means the rule silently
// stops loading, which is easy to miss in review.

import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const rulesDir = join(repoRoot, '.claude', 'rules')

const trackedFiles = () =>
  execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' }).split('\n').filter(Boolean)

const findRules = dir => {
  let out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(findRules(full))
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out.sort()
}

// Claude Code glob syntax: ** spans directories, * does not, {a,b} expands.
export const globToRegExp = glob => {
  const expand = pattern => {
    const match = /\{([^{}]*)\}/.exec(pattern)
    if (!match) return [pattern]
    return match[1]
      .split(',')
      .flatMap(option => expand(pattern.slice(0, match.index) + option + pattern.slice(match.index + match[0].length)))
  }
  return expand(glob).map(pattern => {
    let source = ''
    for (let i = 0; i < pattern.length; i += 1) {
      const char = pattern[i]
      if (char === '*' && pattern[i + 1] === '*') {
        if (pattern[i + 2] === '/') {
          // `**/` spans any number of leading directories, including none, and only ever
          // matches at a path boundary: `**/__tests__/**` must not match `src/foo__tests__/x`.
          source += '(?:.*/)?'
          i += 2
        } else {
          source += '.*'
          i += 1
        }
      } else if (char === '*') source += '[^/]*'
      else if (char === '?') source += '[^/]'
      else source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
    return new RegExp(`^${source}$`)
  })
}

export const parsePaths = (file, text) => {
  const lines = text.split('\n')
  if (lines[0]?.trim() !== '---') return { globs: [], errors: [`${file}: missing YAML frontmatter`] }
  const end = lines.indexOf('---', 1)
  if (end === -1) return { globs: [], errors: [`${file}: unterminated frontmatter`] }

  const globs = []
  let inPaths = false
  for (const line of lines.slice(1, end)) {
    if (line.startsWith('paths:')) inPaths = true
    else if (inPaths && line.trimStart().startsWith('- '))
      globs.push(
        line
          .trimStart()
          .slice(2)
          .trim()
          .replace(/^['"]|['"]$/g, '')
      )
    else if (line.trim() && !line.startsWith(' ') && !line.startsWith('-')) inPaths = false
  }
  if (globs.length === 0)
    return { globs: [], errors: [`${file}: no 'paths:' globs (the rule would load every session)`] }
  return { globs, errors: [] }
}

const main = () => {
  const rules = findRules(rulesDir)
  if (rules.length === 0) {
    console.log(`No rules found in ${rulesDir}`)
    return 0
  }

  const files = trackedFiles()
  const errors = []

  for (const rule of rules) {
    const name = relative(repoRoot, rule)
    const { globs, errors: ruleErrors } = parsePaths(name, readFileSync(rule, 'utf8'))
    errors.push(...ruleErrors)
    for (const glob of globs) {
      const patterns = globToRegExp(glob)
      if (!files.some(file => patterns.some(pattern => pattern.test(file)))) {
        errors.push(`${name}: glob '${glob}' matches no tracked file`)
      }
    }
    if (globs.length > 0 && ruleErrors.length === 0) console.log(`ok  ${name}  (${globs.length} glob(s))`)
  }

  for (const error of errors) console.error(`ERROR ${error}`)
  return errors.length > 0 ? 1 : 0
}

// Run only when executed directly, so tests can import the helpers above.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) process.exit(main())
