# @prettier/plugin-hermes

> Prettier Hermes plugin.

## Install

```bash
yarn add --dev prettier @prettier/plugin-hermes
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```json
{
  "overrides": [
    {
      "files": ["**/*.{js.flow,js,mjs,cjs}"],
      "options": {
        "plugins": ["@prettier/plugin-hermes"],
        "parser": "hermes"
      }
    }
  ]
}
```

## Related

- [Hermes](https://github.com/facebook/hermes/blob/main/README.md) - The JavaScript Oxidation Compiler
