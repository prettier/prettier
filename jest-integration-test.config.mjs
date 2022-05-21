import baseConfig from "./jest.config.mjs";

const config = {
  ...baseConfig,
  testRegex: "tests/integration/__tests__/.*\\.js$",
  setupFiles: ["<rootDir>/tests/integration/integration-test-setup.js"],
  projects: [],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    "prettier-local": "<rootDir>/tests/config/prettier-entry.common.cjs",
  },
};

export default config;
