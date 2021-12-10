import baseConfig from "./jest.config.mjs"

const config = {
  runner: "./tests/config/jest-light-runner",
  testRegex: "jsfmt\\.spec\\.js$",
  ...baseConfig
};

export default config;
