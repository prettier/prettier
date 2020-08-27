"use strict";

const installPrettier = require("./scripts/install-prettier");

const ENABLE_CODE_COVERAGE = !!process.env.ENABLE_CODE_COVERAGE;
if (process.env.NODE_ENV === "production" || process.env.INSTALL_PACKAGE) {
  process.env.PRETTIER_DIR = installPrettier();
}
const { TEST_STANDALONE } = process.env;

module.exports = {
  setupFiles: ["<rootDir>/tests_config/run_spec.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns: TEST_STANDALONE
    ? ["<rootDir>/tests_integration/"]
    : [],
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "<rootDir>/bin/**/*.js"],
  coveragePathIgnorePatterns: ["<rootDir>/src/document/doc-debug.js"],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier/local": "<rootDir>/tests_config/require_prettier.js",
    "prettier/standalone": "<rootDir>/tests_config/require_standalone.js",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  testEnvironment: "node",
  transform: {},
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
