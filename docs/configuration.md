---
id: configuration
title: Configuration File
---

Prettier uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support. This means you can configure prettier via:

- A `.prettierrc` file, written in YAML or JSON, with optional extensions: `.yaml/.yml/.json/.js`.
- A `prettier.config.js` file that exports an object.
- A `"prettier"` key in your `package.json` file.

The configuration file will be resolved starting from the location of the file being formatted, and searching up the file tree until a config file is (or isn't) found.

The options to the configuration file are the same as the [API options](options.md).

## Basic Configuration

JSON:

```json
{
  "printWidth": 100,
  "parser": "flow"
}
```

JS:

```js
// .prettierrc.js
module.exports = {
  printWidth: 100,
  parser: "flow"
};
```

YAML:

```yaml
# .prettierrc
printWidth: 100
parser: flow
```

## Configuration Overrides

Prettier borrows eslint's [override format](http://eslint.org/docs/user-guide/configuring#example-configuration). This allows you to apply configuration to specific files.

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
```

`files` is required for each override, and may be a string or array of strings. `excludeFiles` may be optionally provided to exclude files for a given rule, and may also be a string or array of strings.

To get prettier to format its own `.prettierrc` file, you can do:

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

For more information on how to use the CLI to locate a file, see the [CLI](cli.md) section.

## Configuration Schema

If you'd like a JSON schema to validate your configuration, one is available here: http://json.schemastore.org/prettierrc.
