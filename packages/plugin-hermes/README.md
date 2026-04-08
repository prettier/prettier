# @prettier/plugin-hermes

[![Npm Version](https://img.shields.io/npm/v/@prettier/plugin-hermes.svg?style=flat-square)](https://www.npmjs.com/package/@prettier/plugin-hermes)
[![MIT License](https://img.shields.io/npm/l/@prettier/plugin-hermes.svg?style=flat-square)](https://github.com/prettier/prettier/blob/main/license)

> Prettier [Hermes](https://github.com/facebook/hermes/blob/main/README.md) plugin.

## Install

```bash
yarn add --dev --exact prettier @prettier/plugin-hermes
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```js
// prettier.config.mjs
import * as prettierPluginHermes from "@prettier/plugin-hermes";

/** @type {import("prettier").Config} */
const config = {
  plugins: [prettierPluginHermes],
};

export default config;
```

**Requires prettier>=3.6.0**

Or config explicitly

```js
// prettier.config.mjs
import * as prettierPluginHermes from "@prettier/plugin-hermes";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: ["**/*.{js.flow,js,mjs,cjs}"],
      parser: "hermes",
      plugins: [prettierPluginHermes],
    },
  ],
};

export default config;
```
