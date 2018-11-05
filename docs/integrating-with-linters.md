---
id: integrating-with-linters
title: Integrating with Linters
---

Prettier can be integrated into workflows with existing linting tools.
This allows you to use Prettier for code formatting concerns, while letting your linter focus on code-quality concerns as outlined in our [comparison with linters](comparison.md).

Whatever linting tool you wish to integrate with, the steps are broadly similar.
First disable any existing formatting rules in your linter that may conflict with how Prettier wishes to format your code. Then you can either add an extension to your linting tool to format your file with Prettier - so that you only need a single command for format a file, or run your linter then Prettier as separate steps.

All these instructions assume you have already installed `prettier` as a developer dependency.

## ESLint

### Disable formatting rules

[`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) is a config that disables rules that conflict with Prettier. Add it as a developer dependency, then extend from it within your `.eslintrc` configuration. Make sure to put it last in the `extends` array, so it gets the chance to override other configs.

```bash
yarn add --dev eslint-config-prettier
```

Then in `.eslintrc.json`:

```json
{
  "extends": ["prettier"]
}
```

### Use ESLint to run Prettier

[`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) is a plugin that adds a rule that formats content using Prettier. Add it as a developer dependency, then enable the plugin and rule.

```bash
yarn add --dev eslint-plugin-prettier
```

Then in `.eslintrc.json`:

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### Recommended configuration

`eslint-plugin-prettier` exposes a "recommended" configuration that configures both `eslint-plugin-prettier` and `eslint-config-prettier` in a single step. Add both `eslint-plugin-prettier` and `eslint-config-prettier` as developer dependencies, then extend the recommended config:

```bash
yarn add --dev eslint-config-prettier eslint-plugin-prettier
```

Then in `.eslintrc.json`:

```json
{
  "extends": ["plugin:prettier/recommended"]
}
```

## Stylelint


### Disable formatting rules

[`stylelint-config-prettier`](https://github.com/prettier/stylelint-config-prettier) is a config that disables rules that conflict with Prettier. Add it as a developer dependency, then extend from it within your `.stylelintrc` configuration. Make sure to put it last in the `extends` array, so it gets the chance to override other configs.

```bash
yarn add --dev stylelint-config-prettier
```

Then in `.stylelintrc`:

```json
{
  "extends": ["stylelint-config-prettier"]
}
```

### Use Stylelint to run Prettier

[`stylelint-prettier`](https://github.com/prettier/stylelint-prettier) is a plugin that adds a rule that formats content using Prettier. Add it as a developer dependency, then enable the plugin and rule.

```bash
yarn add --dev stylelint-prettier
```

Then in `.stylelintrc`:

```json
{
  "plugins": ["stylelint-prettier"],
  "rules": {
    "prettier/prettier": true
  }
}
```

### Recommended configuration

`stylelint-prettier` exposes a "recommended" configuration that configures both `stylelint-prettier` and `stylelint-config-prettier` in a single step. Add both `stylelint-prettier` and `stylelint-config-prettier` as developer dependencies, then extend the recommended config:

```bash
yarn add --dev stylelint-config-prettier stylelint-prettier
```

Then in `.eslintrc.json`:

```json
{
  "extends": ["stylelint-prettier/recommended"]
}
```
