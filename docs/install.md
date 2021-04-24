---
id: install
title: Install
---

First, install Prettier locally:

<!--DOCUSAURUS_CODE_TABS-->
<!--npm-->

```bash
npm install --save-dev --save-exact prettier
```

<!--yarn-->

```bash
yarn add --dev --exact prettier
```

<!--END_DOCUSAURUS_CODE_TABS-->

Then, create an empty config file to let editors and other tools know you are using Prettier:

<!-- Note: `echo "{}" > .prettierrc.json` would result in `"{}"<SPACE>` on Windows. The below version works in cmd.exe, bash, zsh, fish. -->

```bash
echo {}> .prettierrc.json
```

Next, create a [.prettierignore](ignore.md) file to let the Prettier CLI and editors know which files to _not_ format. Here’s an example:

```
# Ignore artifacts:
build
coverage
```

> Tip! Base your .prettierignore on .gitignore and .eslintignore (if you have one).

> Another tip! If your project isn’t ready to format, say, HTML files yet, add `*.html`.

Now, format all files with Prettier:

<!--DOCUSAURUS_CODE_TABS-->
<!--npm-->

```bash
npx prettier --write .
```

> What is that `npx` thing? `npx` ships with `npm` and lets you run locally installed tools. We’ll leave off the `npx` part for brevity throughout the rest of this file!
>
> Note: If you forget to install Prettier first, `npx` will temporarily download the latest version. That’s not a good idea when using Prettier, because we change how code is formatted in each release! It’s important to have a locked down version of Prettier in your `package.json`. And it’s faster, too.

<!--yarn-->

```bash
yarn prettier --write .
```

> What is `yarn` doing at the start? `yarn prettier` runs the locally installed version of Prettier. We’ll leave off the `yarn` part for brevity throughout the rest of this file!

<!--END_DOCUSAURUS_CODE_TABS-->

`prettier --write .` is great for formatting everything, but for a big project it might take a little while. You may run `prettier --write app/` to format a certain directory, or `prettier --write app/components/Button.js` to format a certain file. Or use a _glob_ like `prettier --write "app/**/*.test.js"` to format all tests in a directory (see [fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) for supported glob syntax).

If you have a CI setup, run the following as part of it to make sure that everyone runs Prettier. This avoids merge conflicts and other collaboration issues!

```bash
npx prettier --check .
```

`--check` is like `--write`, but only checks that files are already formatted, rather than overwriting them. `prettier --write` and `prettier --check` are the most common ways to run Prettier.

## Set up your editor

Formatting from the command line is a good way to get started, but you get the most from Prettier by running it from your editor, either via a keyboard shortcut or automatically whenever you save a file. When a line has gotten so long while coding that it won’t fit your screen, just hit a key and watch it magically be wrapped into multiple lines! Or when you paste some code and the indentation gets all messed up, let Prettier fix it up for you without leaving your editor.

See [Editor Integration](editors.md) for how to set up your editor. If your editor does not support Prettier, you can instead [run Prettier with a file watcher](watching-files.md).

> **Note:** Don’t skip the regular local install! Editor plugins will pick up your local version of Prettier, making sure you use the correct version in every project. (You wouldn’t want your editor accidentally causing lots of changes because it’s using a newer version of Prettier than your project!)
>
> And being able to run Prettier from the command line is still a good fallback, and needed for CI setups.

## ESLint (and other linters)

If you use ESLint, install [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier#installation) to make ESLint and Prettier play nice with each other. It turns off all ESLint rules that are unnecessary or might conflict with Prettier. There’s a similar config for Stylelint: [stylelint-config-prettier](https://github.com/prettier/stylelint-config-prettier)

(See [Prettier vs. Linters](comparison.md) to learn more about formatting vs linting, [Integrating with Linters](integrating-with-linters.md) for more in-depth information on configuring your linters, and [Related projects](related-projects.md) for even more integration possibilities, if needed.)

## Git hooks

In addition to running Prettier from the command line (`prettier --write`), checking formatting in CI, and running Prettier from your editor, many people like to run Prettier as a pre-commit hook as well. This makes sure all your commits are formatted, without having to wait for your CI build to finish.

For example, you can do the following to have Prettier run before each commit:

1. Install [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged):

   <!--DOCUSAURUS_CODE_TABS-->
   <!--npm-->

   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   npm set-script prepare "husky install"
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

   <!--yarn-->

   ```bash
   yarn add --dev husky lint-staged
   npx husky install
   npm set-script prepare "husky install"
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

   > If you use Yarn 2, see https://typicode.github.io/husky/#/?id=yarn-2

   <!--END_DOCUSAURUS_CODE_TABS-->

2. Add the following to your `package.json`:

```json
{
  "lint-staged": {
    "**/*": "prettier --write --ignore-unknown"
  }
}
```

> Note: If you use ESLint, make sure lint-staged runs it before Prettier, not after.

See [Pre-commit Hook](precommit.md) for more information.

## Summary

To summarize, we have learned to:

- Install an exact version of Prettier locally in your project. This makes sure that everyone in the project gets the exact same version of Prettier. Even a patch release of Prettier can result in slightly different formatting, so you wouldn’t want different team members using different versions and formatting each other’s changes back and forth.
- Add a `.prettierrc.json` to let your editor know that you are using Prettier.
- Add a `.prettierignore` to let your editor know which files _not_ to touch, as well as for being able to run `prettier --write .` to format the entire project (without mangling files you don’t want, or choking on generated files).
- Run `prettier --check .` in CI to make sure that your project stays formatted.
- Run Prettier from your editor for the best experience.
- Use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to make Prettier and ESLint play nice together.
- Set up a pre-commit hook to make sure that every commit is formatted.
