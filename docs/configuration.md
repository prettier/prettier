---
id: configuration
title: Configuration File
---

You can configure Prettier via (in order of precedence):

- A `"prettier"` key in your `package.json`, or [`package.yaml`](https://github.com/pnpm/pnpm/pull/1799) file.
- A `.prettierrc` file written in JSON or YAML.
- A `.prettierrc.json`, `.prettierrc.yml`, `.prettierrc.yaml`, or `.prettierrc.json5` file.
- A `.prettierrc.js`, `prettier.config.js`, `.prettierrc.ts`, or `prettier.config.ts` file that exports an object using `export default` or `module.exports` (depends on the [`type`](https://nodejs.org/api/packages.html#type) value in your `package.json`).
- A `.prettierrc.mjs`, `prettier.config.mjs`, `.prettierrc.mts`, or `prettier.config.mts` file that exports an object using `export default`.
- A `.prettierrc.cjs`, `prettier.config.cjs`, `.prettierrc.cts`, or `prettier.config.cts` file that exports an object using `module.exports`.
- A `.prettierrc.toml` file.

> TypeScript configuration files support requires [additional setup](#typescript-configuration-files)

The configuration file will be resolved starting from the location of the file being formatted, and searching up the file tree until a config file is (or isn’t) found.

Prettier intentionally doesn’t support any kind of global configuration. This is to make sure that when a project is copied to another computer, Prettier’s behavior stays the same. Otherwise, Prettier wouldn’t be able to guarantee that everybody in a team gets the same consistent results.

The options you can use in the configuration file are the same as the [API options](options.md).

### TypeScript Configuration Files

TypeScript support for Node.js is currently experimental, Node.js>=22.6.0 is required and `--experimental-strip-types` is required to run Node.js.

```sh
node --experimental-strip-types node_modules/prettier/bin/prettier.cjs . --write
```

or

```sh
NODE_OPTIONS="--experimental-strip-types" prettier . --write
```

## Basic Configuration

JSON:

```json
{
  "trailingComma": "es5",
  "tabWidth": 4,
  "semi": false,
  "singleQuote": true
}
```

JS (ES Modules):

```js
// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5",
  tabWidth: 4,
  semi: false,
  singleQuote: true,
};

export default config;
```

JS (CommonJS):

```js
// prettier.config.js, .prettierrc.js, prettier.config.cjs, or .prettierrc.cjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5",
  tabWidth: 4,
  semi: false,
  singleQuote: true,
};

module.exports = config;
```

TypeScript (ES Modules):

```ts
// prettier.config.ts, .prettierrc.ts, prettier.config.mts, or .prettierrc.mts

import { type Config } from "prettier";

const config: Config = {
  trailingComma: "none",
};

export default config;
```

TypeScript (CommonJS):

```ts
// prettier.config.ts, .prettierrc.ts, prettier.config.cts, or .prettierrc.cts

import { type Config } from "prettier";

const config: Config = {
  trailingComma: "none",
};

module.exports = config;
```

YAML:

```yaml
# .prettierrc or .prettierrc.yaml
trailingComma: "es5"
tabWidth: 4
semi: false
singleQuote: true
```

TOML:

```toml
# .prettierrc.toml
trailingComma = "es5"
tabWidth = 4
semi = false
singleQuote = true
```

## Configuration Overrides

Overrides let you have different configuration for certain file extensions, folders and specific files.

Prettier borrows ESLint’s [override format](https://eslint.org/docs/latest/user-guide/configuring/configuration-files#how-do-overrides-work).

JSON:

```json
{
  "semi": false,
  "overrides": [
    {
      "files": "*.test.js",
      "options": {
        "semi": true
      }
    },
    {
      "files": ["*.html", "legacy/**/*.js"],
      "options": {
        "tabWidth": 4
      }
    }
  ]
}
```

YAML:

```yaml
semi: false
overrides:
  - files: "*.test.js"
    options:
      semi: true
  - files:
      - "*.html"
      - "legacy/**/*.js"
    options:
      tabWidth: 4
```

`files` is required for each override, and may be a string or array of strings. `excludeFiles` may be optionally provided to exclude files for a given rule, and may also be a string or array of strings.

## Setting the [parser](options.md#parser) option

By default, Prettier automatically infers which parser to use based on the input file extension. Combined with `overrides` you can teach Prettier how to parse files it does not recognize.

For example, to get Prettier to format its own `.prettierrc` file, you can do:

```json
{
  "overrides": [
    {
      "files": ".prettierrc",
      "options": { "parser": "json" }
    }
  ]
}
```

You can also switch to the `flow` parser instead of the default `babel` for .js files:

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": {
        "parser": "flow"
      }
    }
  ]
}
```

**Note:** _Never_ put the `parser` option at the top level of your configuration. _Only_ use it inside `overrides`. Otherwise you effectively disable Prettier’s automatic file extension based parser inference. This forces Prettier to use the parser you specified for _all_ types of files – even when it doesn’t make sense, such as trying to parse a CSS file as JavaScript.

## Configuration Schema

If you’d like a JSON schema to validate your configuration, one is available here: <https://json.schemastore.org/prettierrc>.

## EditorConfig

If a [`.editorconfig` file](https://editorconfig.org/) is in your project, Prettier will parse it and convert its properties to the corresponding Prettier configuration. This configuration will be overridden by `.prettierrc`, etc.

Here’s an annotated description of how different properties map to Prettier’s behavior:

```ini
# Stop the editor from looking for .editorconfig files in the parent directories
# root = true

[*]
# Non-configurable Prettier behaviors
charset = utf-8
insert_final_newline = true
# Caveat: Prettier won’t trim trailing whitespace inside template strings, but your editor might.
# trim_trailing_whitespace = true

# Configurable Prettier behaviors
# (change these if your Prettier config differs)
end_of_line = lf
indent_style = space
indent_size = 2
max_line_length = 80
```

Here’s a copy+paste-ready `.editorconfig` file if you use the default options:

```ini
[*]
charset = utf-8
insert_final_newline = true
end_of_line = lf
indent_style = space
indent_size = 2
max_line_length = 80
```
