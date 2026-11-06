#!/usr/bin/env node
// Regenerates src/types/database.ts from the live Supabase project.
//
//   npm run gen:types     write the file
//   npm run check:types   write it and fail if it differs from the committed copy
//
// Authentication: SUPABASE_ACCESS_TOKEN (a Supabase personal access token) is sent as a
// bearer token when it is set; without it the request goes out unauthenticated, which only
// works behind a proxy that injects credentials. Override the project with
// SUPABASE_PROJECT_REF. `supabase gen types typescript --project-id <ref>` produces the same
// file; this script keeps the Supabase CLI out of the dependency tree.

import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'dzujjhzgzguciwryzwlx'
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'types', 'database.ts')
const URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/types/typescript?included_schemas=public`
const HEADER = `// GENERATED FILE, do not edit; run \`npm run gen:types\` to refresh it from the live
// Supabase project (schema \`public\`). \`npm run check:types\` fails when it is stale.
`

// curl is used instead of fetch() so that a proxy configured for the shell (HTTPS_PROXY and
// friends) is honoured; undici ignores those variables.
const curl = (args, stdin) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn('curl', args, { stdio: ['pipe', 'pipe', 'inherit'] })
    let stdout = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', chunk => {
      stdout += chunk
    })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolvePromise(stdout)
      else reject(new Error(`curl exited with code ${code}`))
    })
    child.stdin.end(stdin ?? '')
  })

const run = (command, args) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })

// The token is passed on stdin rather than in argv so it does not show up in process lists.
const config = [`url = "${URL}"`, 'fail', 'silent', 'show-error']
if (process.env.SUPABASE_ACCESS_TOKEN) {
  config.push(`header = "Authorization: Bearer ${process.env.SUPABASE_ACCESS_TOKEN}"`)
}

let payload
try {
  payload = JSON.parse(await curl(['--config', '-'], `${config.join('\n')}\n`))
} catch (error) {
  console.error(`Could not fetch types for project ${PROJECT_REF}: ${error.message}`)
  console.error('Set SUPABASE_ACCESS_TOKEN to a Supabase personal access token and retry.')
  process.exit(1)
}

if (typeof payload.types !== 'string' || !payload.types.includes('export type Database')) {
  console.error('Unexpected response from the Supabase Management API: no `types` payload.')
  process.exit(1)
}

await writeFile(OUTPUT, `${HEADER}\n${payload.types.trimStart()}`, 'utf8')
await run('npx', ['prettier', '--write', OUTPUT])
