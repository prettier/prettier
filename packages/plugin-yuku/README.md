# @prettier/plugin-yuku

[![Npm Version](https://img.shields.io/npm/v/@prettier/plugin-yuku.svg?style=flat-square)](https://www.npmjs.com/package/@prettier/plugin-yuku)
[![MIT License](https://img.shields.io/npm/l/@prettier/plugin-yuku.svg?style=flat-square)](https://github.com/prettier/prettier/blob/main/license)

> Prettier [yuku](https://yuku.fyi/) plugin.

## Install

```bash
yarn add --dev --exact prettier @prettier/plugin-yuku
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```js
// prettier.config.mjs
import * as prettierPluginYuku from "@prettier/plugin-yuku";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: [prettierPluginYuku],
};

export default config;
```

**Requires prettier>=3.6.0**

Or config explicitly

```js
// prettier.config.mjs
import * as prettierPluginYuku from "@prettier/plugin-yuku";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,jsx}"],
      parser: "yuku",
      plugins: [prettierPluginYuku],
    },
  ],
};

export default config;
```
