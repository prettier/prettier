---
id: eslint
title: Integrating with ESLint
---

If you are using ESLint, integrating Prettier to your workflow is straightforward.

There are two different ways you might want to integrate Prettier into ESLint. You may enable either one separately, or both.

## Use ESLint to run Prettier

If you're already running ESLint in your project and would like to do all of your style checking with a single command execution, you can ask ESLint to run Prettier for you.

Just add Prettier as an ESLint rule using [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier).

```js
yarn add --dev prettier eslint-plugin-prettier

// .eslintrc.json
{
  "plugins": [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## Turn off ESLint's formatting rules

Whether you run Prettier via ESLint or run both tools separately, you probably only want to hear about each formatting issue once, and you especially don't want ESLint to complain about formatting "issues" which are simply a different preference than what Prettier does.

So you'll probably want to disable the conflicting rules (while keeping around other rules that Prettier doesn't care about). The easiest way to do this is to use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier). It's a one liner that can be added on-top of any existing ESLint configuration.

```
$ yarn add --dev eslint-config-prettier
```

.eslintrc.json:

```json
{
  "extends": ["prettier"]
}
```

There are a few rules that this disables that you may want to turn back on as long as you don't use them with particular options which conflict with Prettier. See [the docs](https://github.com/prettier/eslint-config-prettier#special-rules) for details.
