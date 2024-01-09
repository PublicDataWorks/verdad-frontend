Install the dependencies:

```bash
npm install
```

## Usage

To start the project in dev mode:

```bash
npm run dev
```

Open the project in browser using this link:
[https://0.0.0.0:5173](https://0.0.0.0:5173)

To build the project:

```bash
npm run build
```

## Running Tests

### Setup E2E test

```bash
cp cypress.env.json.sample cypress.env.json
```

### Run tests

To run unit test:

```bash
npm run test:unit
```

To run end-to-end tests interactively:

```bash
npm run test:e2e:open
```

To run end-to-end tests headless-ly:

```bash
npm run test:e2e:run
```

To run all tests (unit and e2e) and merge coverage reports (to run in CI
workflows):

```bash
npm run coverage
```

## Architecture

```
.
├── README.md
├── cypress
│   ├── downloads
│   ├── e2e
│   │   └── home.cy.js
│   ├── fixtures
│   ├── jsconfig.json
│   └── support
│       ├── commands.js
│       └── e2e.js
├── cypress.config.cjs
├── index.html
├── jsconfig.json
├── merge-cov.cjs
├── package-lock.json
├── package.json
├── public/
├── src
│   ├── App.jsx
│   ├── App.scss
│   ├── App.test.jsx
│   ├── AppRoutes.tsx
│   ├── apis/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── main.jsx
│   ├── pages
│   │   ├── Home
│   │   │   ├── Home.test.jsx
│   │   │   └── index.jsx
│   │   ├── Login
│   │   │   └── index.jsx
│   │   └── ...
│   └── vitest-setup.js
└── vite.config.js
```

TBU

## Contributing

### Coding style

Install pre-commit hook:

```bash
npm run prepare
```

Toolings:

We are using `Prettier` to format the code, please add it to your editor/IDE and
make sure that it picks up the right config of this project
at `/.prettierrc.cjs`.

The pre-commit hook will run `npm run lint` before every commit. You can also
install `eslint` plugin to your editor/IDE to see the visualized error while
coding.

Please note that the unassigned imports (i.e. `import './*.scss'`) are ignored
by the linter, please put them together with the sibling import group.

## Translation

See detail [here](./i18n-script/README.md)
