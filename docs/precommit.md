---
id: precommit
title: Pre-commit Hook
---

You can use Prettier with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add` before you commit.

## Option 1. [lint-staged](https://github.com/okonet/lint-staged)

**Use Case:** Useful for when you need to use other tools on top of Prettier (e.g. ESLint)

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add lint-staged husky@next --dev
```

and add this config to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,json,css,md}": ["prettier --write", "git add"]
  }
}
```

**Warning:** Currently there is a limitation where if you stage specific lines this approach will stage the whole file after formatting. See this [issue](https://github.com/okonet/lint-staged/issues/62) for more info.

See https://github.com/okonet/lint-staged#configuration for more details about how you can configure lint-staged.

## Option 2. [pretty-quick](https://github.com/azz/pretty-quick)

**Use Case:** Great for when you want an entire file formatting on your changed/staged files.

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add pretty-quick husky@next --dev
```

and add this config to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

Find more info from [here](https://github.com/azz/pretty-quick).

## Option 3. [pre-commit](https://github.com/pre-commit/pre-commit)

**Use Case:** Great when working with multi-language projects.

Copy the following config into your `.pre-commit-config.yaml` file:

```yaml
- repo: https://github.com/prettier/prettier
  rev: "" # Use the sha or tag you want to point at
  hooks:
    - id: prettier
```

Find more info from [here](https://pre-commit.com).

## Option 4. [precise-commits](https://github.com/JamesHenry/precise-commits)

**Use Case:** Great for when you want an partial file formatting on your changed/staged files.

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add precise-commits husky@next --dev
```

and add this config to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "precise-commits"
    }
  }
}
```

**Note:** This is currently the only tool that will format only staged lines rather than the entire file. See more information [here](https://github.com/JamesHenry/precise-commits#why-precise-commits)

Read more about this tool [here](https://github.com/JamesHenry/precise-commits#2-precommit-hook).

## Option 5. bash script

Alternately you can save this script as `.git/hooks/pre-commit` and give it execute permission:

```bash
#!/bin/sh
jsfiles=$(git diff --cached --name-only --diff-filter=ACM "*.js" "*.jsx" | tr '\n' ' ')
[ -z "$jsfiles" ] && exit 0

# Prettify all staged .js files
echo "$jsfiles" | xargs ./node_modules/.bin/prettier --write

# Add back the modified/prettified files to staging
echo "$jsfiles" | xargs git add

exit 0
```

If git is reporting that your prettified files are still modified after committing, you may need to add a post-commit script to update git's index as described in [this issue](https://github.com/prettier/prettier/issues/2978#issuecomment-334408427).

Add something like the following to `.git/hooks/post-commit`:

```bash
#!/bin/sh
git update-index -g
```
