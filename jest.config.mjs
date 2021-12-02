const isProduction = process.env.NODE_ENV === "production";
const ENABLE_CODE_COVERAGE = Boolean(process.env.ENABLE_CODE_COVERAGE);
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);

const testPathIgnorePatterns = [];
if (TEST_STANDALONE) {
  testPathIgnorePatterns.push("<rootDir>/tests/integration/");
}
if (!isProduction) {
  // Only test bundles for production
  testPathIgnorePatterns.push(
    "<rootDir>/tests/integration/__tests__/bundle.js"
  );
}

const config = {
  setupFilesAfterEnv: ["<rootDir>/tests/config/install-prettier.mjs"],
  setupFiles: ["<rootDir>/tests/config/setup.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns,
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "<rootDir>/bin/**/*.js"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/standalone.js",
    "<rootDir>/src/document/doc-debug.js",
  ],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier-local": "<rootDir>/tests/config/require-prettier.js",
    "prettier-standalone": "<rootDir>/tests/config/require-standalone.js",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/dist",
    "<rootDir>/website",
    "<rootDir>/scripts/release",
  ],
  transform: {},
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};

export default config;
