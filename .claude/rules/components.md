---
paths:
  - 'src/components/**'
  - 'src/pages/**'
  - 'src/layouts/**'
---

# Components, pages and layouts

## shadcn/ui

`src/components/ui/` is generated shadcn/ui (config in `components.json`). Edit those primitives sparingly -
prefer composing them or wrapping them in a feature component, because a later `shadcn add` overwrite would
drop local edits. Compose Tailwind classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge) so callers
can override a class instead of fighting specificity.

## Every user-visible string is bilingual

UI copy lives in `src/constants/translations.ts`, a single object with exactly two keys, `english` and
`spanish` (`Language` in `src/providers/language.tsx`). Components read it as
`const t = translations[language]` with `language` from `useLanguage()`. **Add every new key under both
`english` and `spanish`** - a key present in only one is not a type error, it renders `undefined` for half
the users. Never hardcode a user-facing string in JSX.

`LanguageTabs` (`src/components/LanguageTab.tsx`) is unrelated to that: it toggles a snippet's _source_
transcript against its English translation. Snippet audio is Spanish or Arabic; the UI itself is only
English/Spanish.

Theme comes from `ThemeProvider` (`src/providers/theme.tsx`), which toggles the `light`/`dark` class plus
`data-theme` on `<html>` and persists to `localStorage`. Style dark mode with Tailwind's `dark:` variants;
do not read the theme in a component to pick a color.

## Lint rules that bite in JSX

The config extends `eslint:all` + airbnb with only targeted relaxations, and `npm run lint` allows zero
warnings. The ones that reject otherwise-fine JSX:

- `react/button-has-type`: every `<button>` needs an explicit `type='button'` (or `submit`).
- `react/jsx-handler-names`: handler props and the functions passed to them are `onX`; inline arrows are
  exempt. `react/jsx-no-bind` forbids `.bind()` (arrow functions are fine).
- `react/jsx-no-useless-fragment`, `react/jsx-key`, `react/jsx-no-constructed-context-values` and
  `react/no-unstable-nested-components` are errors - define nested components outside the render.
- `capitalized-comments`: comments start with a capital letter.
- `no-console` allows only `console.warn` / `console.error`.
- `react-prefer-function-component`: no class components.

a11y: most `jsx-a11y` rules are on. `click-events-have-key-events`, `no-static-element-interactions` and
`media-has-caption` (radio clips have no caption track) are off, and `label-has-associated-control` accepts
`htmlFor` alone - everything else (alt text, `aria-*` validity, anchor validity, roles) still applies.

`react/prop-types` and `react/require-default-props` are off: type props with a TypeScript interface and
default them in the parameter list. Do not add `eslint-disable` for the `@typescript-eslint/no-unsafe-*`
family; type the data instead.

## Visual changes

There are no snapshot or Cypress specs, so a visual change is only verified by looking at it. Include a
screenshot (or the preview app `pr-<n>-verdad-frontend.fly.dev`) in the PR for anything that changes layout,
spacing or color, in both light and dark mode.
