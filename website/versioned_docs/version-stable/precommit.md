---
id: version-stable-precommit
title: Pre-commit Hook
original_id: precommit
---

You can use Prettier with a pre-commit tool. This can re-format your files that are marked as “staged” via `git add` before you commit.

## Option 1. [lint-staged](https://github.com/okonet/lint-staged)

**Use Case:** Useful for when you want to use other code quality tools along with Prettier (e.g. ESLint, Stylelint, etc.) or if you need support for partially staged files (`git add --patch`).

_Make sure Prettier is installed and is in your [`devDependencies`](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file) before you proceed._

```bash
npx mrm@2 lint-staged
```

This will install [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged), then add a configuration to the project’s `package.json` that will automatically format supported files in a pre-commit hook.

Read more at the [lint-staged](https://github.com/okonet/lint-staged#configuration) repo.

## Option 2. [Husky.Net](https://github.com/alirezanet/Husky.Net)

**Use Case:** A dotnet solution to use Prettier along with other code quality tools (e.g. dotnet-format, ESLint, Stylelint, etc.). It supports multiple file states (staged - last-commit, git-files etc.)

```bash
dotnet new tool-manifest
dotnet tool install husky
dotnet husky install
dotnet husky add pre-commit
```

after installation you can add prettier task to the `task-runner.json`.

```json
{
  "command": "npx",
  "args": ["prettier", "--ignore-unknown", "--write", "${staged}"],
  "pathMode": "absolute"
}
```

## Option 3. [git-format-staged](https://github.com/hallettj/git-format-staged)

**Use Case:** Great for when you want to format partially-staged files, and other options do not provide a good fit for your project.

Git-format-staged is used to run any formatter that can accept file content via stdin. It operates differently than other tools that format partially-staged files: it applies the formatter directly to objects in the git object database, and merges changes back to the working tree. This procedure provides several guarantees:

1. Changes in commits are always formatted.
2. Unstaged changes are never, under any circumstances staged during the formatting process.
3. If there are conflicts between formatted, staged changes and unstaged changes then your working tree files are left untouched - your work won’t be overwritten, and there are no stashes to clean up.
4. Unstaged changes are not formatted.

Git-format-staged requires Python v3 or v2.7. Python is usually pre-installed on Linux and macOS, but not on Windows. Use git-format-staged with [husky](https://github.com/typicode/husky):

<!--DOCUSAURUS_CODE_TABS-->
<!--npm-->

```bash
npx husky init
npm install --save-dev git-format-staged
node --eval "fs.writeFileSync('.husky/pre-commit', 'git-format-staged -f \'prettier --ignore-unknown --stdin --stdin-filepath \"{}\"\' .\n')"
```

<!--yarn-->

```bash
yarn husky init
yarn add --dev git-format-staged
node --eval "fs.writeFileSync('.husky/pre-commit', 'git-format-staged -f \'prettier --ignore-unknown --stdin --stdin-filepath \"{}\"\' .\n')"
```

<!--pnpm-->

```bash
pnpm exec husky init
pnpm add --save-dev git-format-staged
node --eval "fs.writeFileSync('.husky/pre-commit', 'git-format-staged -f \'prettier --ignore-unknown --stdin --stdin-filepath \"{}\"\' .\n')"
```

<!--bun-->

```bash
bunx husky init
bun add --dev git-format-staged
bun --eval "fs.writeFileSync('.husky/pre-commit', 'git-format-staged -f \'prettier --ignore-unknown --stdin --stdin-filepath \"{}\"\' .\n')"
```

<!--END_DOCUSAURUS_CODE_TABS-->

Add or remove file extensions to suit your project. Note that regardless of which extensions you list formatting will respect any `.prettierignore` files in your project.

To read about how git-format-staged works see [Automatic Code Formatting for Partially-Staged Files](https://www.olioapps.com/blog/automatic-code-formatting/).

## Option 4. Shell script

Alternately you can save this script as `.git/hooks/pre-commit` and give it execute permission:

```sh
#!/bin/sh
FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')
[ -z "$FILES" ] && exit 0

# Prettify all selected files
echo "$FILES" | xargs ./node_modules/.bin/prettier --ignore-unknown --write

# Add back the modified/prettified files to staging
echo "$FILES" | xargs git add

exit 0
```

If git is reporting that your prettified files are still modified after committing, you may need to add a [post-commit script to update git’s index](https://github.com/prettier/prettier/issues/2978#issuecomment-334408427).

Add something like the following to `.git/hooks/post-commit`:

```sh
#!/bin/sh
git update-index -g
```
