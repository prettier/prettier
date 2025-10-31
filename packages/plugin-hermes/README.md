# @prettier/plugin-hermes

[![Npm Version](https://img.shields.io/npm/v/@prettier/plugin-hermes.svg?style=flat-square)](https://www.npmjs.com/package/@prettier/plugin-hermes)
[![MIT License](https://img.shields.io/npm/l/@prettier/plugin-hermes.svg?style=flat-square)](https://github.com/prettier/prettier/blob/main/license)

> Prettier [Hermes](https://github.com/facebook/hermes/blob/main/README.md) plugin.

## Install

```bash
yarn add --dev prettier @prettier/plugin-hermes
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```yaml
plugins:
  - "@prettier/plugin-hermes"
```

**Requires prettier >= 3.6**

Or config explicitly

```yaml
overrides:
  - files:
      - "**/*.{js.flow,js,mjs,cjs}"
    options:
      plugins:
        - "@prettier/plugin-hermes"
      parser: hermes
```
