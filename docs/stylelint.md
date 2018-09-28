---
id: stylelint
title: Integrating with Stylelint
---

If you are using Stylelint, integrating Prettier to your workflow is straightforward.

There are two different ways you might want to integrate Prettier into Stylelint. You may enable either one separately, or both.

## Use Stylelint to run Prettier

If you're already running Stylelint in your project and would like to do all of your style checking with a single command execution, you can ask Stylelint to run Prettier for you.

Add Prettier as a Stylelint rule using [stylelint-prettier](https://github.com/BPScott/stylelint-prettier).

```bash
yarn add --dev prettier stylelint-prettier
```

.stylelintrc:

```json
{
  "plugins": ["stylelint-prettier"],
  "rules": {
    "prettier/prettier": true
  }
}
```

## Turn off Stylelint's formatting rules

Whether you run Prettier via Stylelint or run both tools separately, you probably only want to hear about each formatting issue once, and you especially don't want Stylelint to complain about formatting "issues" which are simply a different preference than what Prettier does.

So you'll probably want to disable the conflicting rules (while keeping around other rules that Prettier doesn't care about). The easiest way to do this is to use [stylelint-config-prettier](https://github.com/prettier/stylelint-config-prettier). It's a one liner that can be added on-top of any existing Stylelint configuration.

```bash
yarn add --dev stylelint-config-prettier
```

.stylelint:

```json
{
  "extends": ["stylelint-config-prettier"]
}
```

## Why not both?

`stylelint-prettier` exposes a `"recommended"` configuration that turns on both `stylelint-prettier` and `stylelint-config-prettier`, all you need in your `.stylelintrc` is:

```json
{
  "extends": ["stylelint-prettier/recommended"]
}
```

Remember to install both `stylelint-prettier` and `stylelint-config-prettier`:

```bash
yarn add --dev stylelint-prettier stylelint-config-prettier
```
