# @prettier/plugin-oxc

> Prettier Oxc plugin.

## Install

```bash
yarn add --dev prettier @prettier/plugin-oxc
```

## Usage

Create or modify your [prettier configuration file](https://prettier.io/docs/en/configuration) to use the plugin:

```json
{
  "overrides": [
    {
      "files": ["**/*.{js,mjs,cjs}"],
      "options": {
        "plugins": ["@prettier/plugin-oxc"],
        "parser": "oxc"
      }
    }
  ]
}
```

## Related

- [Oxc](https://oxc.rs/) - The JavaScript Oxidation Compiler
