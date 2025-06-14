# @prettier/plugin-oxc

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
