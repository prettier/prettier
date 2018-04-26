"use strict";

const ENABLE_COVERAGE = !!process.env.CI;

module.exports = {
  setupFiles: ["<rootDir>/tests_config/run_spec.js"],
  snapshotSerializers: ["<rootDir>/tests_config/raw-serializer.js"],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns: ["tests/new_react", "tests/more_react"],
  collectCoverage: ENABLE_COVERAGE,
  collectCoverageFrom: ["src/**/*.js", "index.js", "!<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: [
    "<rootDir>/web.js",
    "<rootDir>/src/doc/doc-debug.js",
    "<rootDir>/src/main/massage-ast.js"
  ],
  moduleNameMapper: {
    // Jest wires `fs` to `graceful-fs`, which causes a memory leak when
    // `graceful-fs` does `require('fs')`.
    // Ref: https://github.com/facebook/jest/issues/2179#issuecomment-355231418
    // If this is removed, see also rollup.bin.config.js and rollup.index.config.js.
    "graceful-fs": "<rootDir>/tests_config/fs.js"
  },
  transform: {}
};
