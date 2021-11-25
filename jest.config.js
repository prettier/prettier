"use strict";

const path = require("path");
const installPrettier = require("./tests/config/install-prettier.js");

const PROJECT_ROOT = __dirname;
const isProduction = process.env.NODE_ENV === "production";
const ENABLE_CODE_COVERAGE = Boolean(process.env.ENABLE_CODE_COVERAGE);
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);
const INSTALL_PACKAGE = Boolean(process.env.INSTALL_PACKAGE);

let PRETTIER_DIR = isProduction
  ? path.join(PROJECT_ROOT, "dist")
  : PROJECT_ROOT;
if (INSTALL_PACKAGE || (isProduction && !TEST_STANDALONE)) {
  PRETTIER_DIR = installPrettier(PRETTIER_DIR);
}
process.env.PRETTIER_DIR = PRETTIER_DIR;

const babelJestTransform = [
  "babel-jest",
  {
    presets: [
      [
        "@babel/env",
        {
          targets: { node: "current" },
          exclude: [
            "transform-async-to-generator",
            "transform-classes",
            "proposal-async-generator-functions",
            "transform-regenerator",
          ],
        },
      ],
    ],
  },
];

const testPathIgnorePatterns = [];
let transform = {};
if (TEST_STANDALONE) {
  testPathIgnorePatterns.push("<rootDir>/tests/integration/");
}
if (isProduction) {
  // `esm` bundles need transform
  transform = {
    "(?:\\.mjs|codeSamples\\.js)$": babelJestTransform,
  };
} else {
  transform = {
    ".js$": babelJestTransform,
  };
  // Only test bundles for production
  testPathIgnorePatterns.push(
    "<rootDir>/tests/integration/__tests__/bundle.js"
  );
}

const esmPackagePatterns = [
  "bail",
  "ccount",
  "character-entities",
  "decode-named-character-reference",
  "is-plain-obj",
  "longest-streak",
  "markdown-table",
  "mdast.*",
  "micromark.*",
  "remark.*",
  "trough",
  "unified",
  "unist.*",
  "vfile.*",
];

module.exports = {
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
  transform,
  transformIgnorePatterns: [
    `<rootDir>/node_modules/(?!(${esmPackagePatterns.join("|")})/)`,
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
