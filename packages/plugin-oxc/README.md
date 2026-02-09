# @prettier/plugin-oxc

[![Npm Version](https://img.shields.io/npm/v/@prettier/plugin-oxc.svg?style=flat-square)](https://www.npmjs.com/package/@prettier/plugin-oxc)
[![MIT License](https://img.shields.io/npm/l/@prettier/plugin-oxc.svg?style=flat-square)](https://github.com/prettier/prettier/blob/main/license)

> Prettier [Oxc](https://oxc.rs/) plugin.

## Install

```bash
yarn add --dev --exact prettier @prettier/plugin-oxc
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```js
// prettier.config.mjs
import * as prettierPluginOxc from "@prettier/plugin-oxc";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: [prettierPluginOxc],
};

export default config;
```

**Requires prettier>=3.6.0**

Or config explicitly

```js
// prettier.config.mjs
import * as prettierPluginOxc from "@prettier/plugin-oxc";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,jsx}"],
      parser: "oxc",
      plugins: [prettierPluginOxc],
    },
    {
      files: ["**/*.{ts,mts,cts,tsx}"],
      parser: "oxc-ts",
      plugins: [prettierPluginOxc],
    },
  ],
};

export default config;
```

## Supported Options

### oxcRawTransferMode

Enable the Oxc parser’s raw transfer mode for additional performance gains. Please note that raw transfer mode is in [early stages of development](https://github.com/oxc-project/oxc/pull/9516) and may not be supported on all platforms.

```js
// prettier.config.mjs
import * as prettierPluginOxc from "@prettier/plugin-oxc";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,jsx}"],
      parser: "oxc",
      plugins: [prettierPluginOxc],
      oxcRawTransferMode: true,
    },
    {
      files: ["**/*.{ts,mts,cts,tsx}"],
      parser: "oxc-ts",
      plugins: [prettierPluginOxc],
      oxcRawTransferMode: true,
    },
  ],
};

export default config;
```
