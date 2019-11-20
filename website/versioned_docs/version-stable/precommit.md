---
id: version-stable-precommit
title: Pre-commit Hook
original_id: precommit
---

You can use Prettier with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add` before you commit.

## Option 1. [lint-staged](https://github.com/okonet/lint-staged)

**Use Case:** Useful for when you want to use other code quality tools along with Prettier (e.g. ESLint, Stylelint, etc.) or if you need support for partially staged files (`git add --patch`).

_Make sure Prettier is installed and is in your [`devDependencies`](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file) before you proceed._

```bash
npx mrm lint-staged
```

This will install [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged), then add a configuration to the project’s `package.json` that will automatically format supported files in a pre-commit hook.

See https://github.com/okonet/lint-staged#configuration for more details about how you can configure lint-staged.

## Option 2. [pretty-quick](https://github.com/azz/pretty-quick)

**Use Case:** Great for when you want an entire file formatting on your changed/staged files.

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add pretty-quick husky --dev
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

**Use Case:** Great for when you want partial file formatting on your changed/staged files.

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add precise-commits husky --dev
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
FILES=$(git diff --cached --name-only --diff-filter=ACMR "*.js" "*.jsx" | sed 's| |\\ |g')
[ -z "$FILES" ] && exit 0

# Prettify all selected files
echo "$FILES" | xargs ./node_modules/.bin/prettier --write

# Add back the modified/prettified files to staging
echo "$FILES" | xargs git add

exit 0
```

If git is reporting that your prettified files are still modified after committing, you may need to add a post-commit script to update git's index as described in [this issue](https://github.com/prettier/prettier/issues/2978#issuecomment-334408427).

Add something like the following to `.git/hooks/post-commit`:

```bash
#!/bin/sh
git update-index -g
```
