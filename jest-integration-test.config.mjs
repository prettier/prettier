import baseConfig from "./jest.config.mjs";

const config = {
  ...baseConfig,
  testRegex: "tests/integration/__tests__/.*\\.js$",
  projects: [],
};

export default config;
