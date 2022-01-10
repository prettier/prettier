import baseConfig from "./jest.config.mjs";

const config = {
  ...baseConfig,
  displayName: "Integration",
  testRegex: "tests/integration/__tests__/.*\\.js$",
  projects: [],
};

export default config;
