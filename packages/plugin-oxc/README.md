# @prettier/plugin-oxc

[![Npm Version](https://img.shields.io/npm/v/@prettier/plugin-oxc.svg?style=flat-square)](https://www.npmjs.com/package/@prettier/plugin-oxc)
[![MIT License](https://img.shields.io/npm/l/@prettier/plugin-oxc.svg?style=flat-square)](https://github.com/prettier/prettier/blob/main/license)

> Prettier [Oxc](https://oxc.rs/) plugin.

## Install

```bash
yarn add --dev prettier @prettier/plugin-oxc
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```yaml
plugins:
  - "@prettier/plugin-oxc"
```

**Requires prettier >= 3.6**

Or config explicitly

```yaml
overrides:
  - files:
      - "**/*.{js,mjs,cjs,jsx}"
    options:
      plugins:
        - "@prettier/plugin-oxc"
      parser: oxc
  - files:
      - "**/*.{ts,mts,cts,tsx}"
    options:
      plugins:
        - "@prettier/plugin-oxc"
      parser: oxc-ts
```
