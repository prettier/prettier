import baseConfig from "./jest.config.mjs"

const config = {
  runner: "./tests/config/jest-light-runner",
  ...baseConfig
};

export default config;
