import baseConfig from "./jest.config.mjs";

const config = {
  ...baseConfig,
  runner: "jest-light-runner",
  testRegex: "tests/format/.*/jsfmt\\.spec\\.js$",
  setupFiles: ["<rootDir>/tests/config/format-test-setup.js"],
  projects: [],
  coverageProvider: "v8",
};

export default config;
