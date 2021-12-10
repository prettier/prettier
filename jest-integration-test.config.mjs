import baseConfig from "./jest.config.mjs"

const config = {
  testRegex: "tests/integration/__tests__/.*\\.js$",
  ...baseConfig
};

export default config;
