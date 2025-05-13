<h1 align="center">Prettier OXC plugin.</h1>

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
      "plugins": ["@prettier/plugin-oxc"],
      "parser": "oxc",
    }
  ]
}
```
