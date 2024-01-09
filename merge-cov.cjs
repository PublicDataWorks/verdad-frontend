const { execSync } = require('child_process')
const fs = require('fs-extra')

const CYPRESS_COV_FOLDER = 'cypress-coverage'
const VITEST_COV_FOLDER = 'vitest-coverage'
const REPORTS_FOLDER = 'reports'
const FINAL_OUTPUT_FOLDER = 'coverage'

const run = commands => {
  commands.forEach(command => execSync(command, { stdio: 'inherit' }))
}

// Create the reports folder and move the reports from cypress and jest inside it
fs.emptyDirSync(REPORTS_FOLDER)
fs.copyFileSync(`${CYPRESS_COV_FOLDER}/coverage-final.json`, `${REPORTS_FOLDER}/from-cypress.json`)
fs.copyFileSync(`${VITEST_COV_FOLDER}/coverage-final.json`, `${REPORTS_FOLDER}/from-vitest.json`)

fs.emptyDirSync('.nyc_output')
fs.emptyDirSync(FINAL_OUTPUT_FOLDER)

// Run "nyc merge" inside the reports folder, merging the two coverage files into one,
// then generate the final report on the coverage folder
run([
  // "nyc merge" will create a "coverage.json" file on the root, we move it to .nyc_output
  `npm run nyc merge ${REPORTS_FOLDER} && mv coverage.json .nyc_output/out.json`,
  `npm run nyc report -- --reporter lcov --report-dir ${FINAL_OUTPUT_FOLDER}`,
  `rm -rf ${REPORTS_FOLDER} .nyc_output ${CYPRESS_COV_FOLDER} ${VITEST_COV_FOLDER}`
])
