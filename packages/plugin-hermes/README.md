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

export default {
  plugins: [prettierPluginHermes],
};
```

**Requires prettier >= 3.6**

Or config explicitly

```js
// prettier.config.mjs
import * as prettierPluginHermes from "@prettier/plugin-hermes";

export default {
  overrides: [
    {
      files: ["**/*.{js.flow,js,mjs,cjs}"],
      parser: "hermes",
      plugins: [prettierPluginHermes],
    },
  ],
};
```
