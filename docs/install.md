---
id: install
title: Install
---

First, install Prettier locally:

```sh
npm install --save-dev --save-exact prettier
```

Then, create an empty config file to let editors and other tooling know you are using Prettier:

```sh
echo "{}" > .prettierrc.json
```

Next, create a `.prettierignore` file to let the Prettier CLI and editors know which files to _not_ format:

```sh
# It’s usually good to start off from your
# .gitignore or .eslintignore, if you have one:
cp .gitignore .prettierignore
# or:
cp .eslintignore .prettierignore
# Then edit with your editor of choice:
vim .prettierignore
```

For example, you might want to ignore `build/` and `coverage/`. And if your project isn’t ready to format, say, HTML files yet, add `*.html`.

Now, format all files with Prettier:

```sh
npx prettier --write .
```

If you have a CI setup, run this as part of it to make sure that everyone runs Prettier to avoid merge conflicts and other collaboration issues:

```sh
prettier --check .
```

`--check` is like `--write`, but only checks that files are already formatted, rather than overwriting them. `prettier --write` and `prettier --check` are the most common ways to run Prettier.

If you use ESLint, install [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier#installation) to make ESLint and Prettier play nice with each other. It turns off all ESLint rules that are unnecessary or might conflict with Prettier. There’s a similar thing for Stylelint: [stylelint-config-prettier](https://github.com/prettier/stylelint-config-prettier)

(See [Prettier vs. Linters](comparison.md) to learn more about formatting vs linting, [Integrating with Linters](integrating-with-linters.md) for more in-depth information on configuring your linters, and [Related projects](related-projects.md) for even more integration possibilities, if needed.)

`prettier --write .` is great for formatting everything, but for a big project it might take a little while. You may run `prettier --write app/` to format a certain directory, or `prettier --write app/components/Button.js` to format a certain files. Or `prettier --write "app/**/*.test.js"` to format all tests in a directory.

Formatting from the command line is a good fallback, but you get the most from Prettier by running it from your editor, either via a keyboard shortcut or on save. When a line has gotten so long while coding that it won’t fit your screen, just hit a key and watch it magically be wrapped into multiple lines. Or when you paste some code and the indentation gets all messed up, let Prettier fix it up for you without leaving your editor.

See [Editor Integration](editors.md) for how to set up your editor. If your editor does not support Prettier, you can instead [run Prettier with a file watcher](watching-files.md).

In addition to running Prettier from the command line (`prettier --write`), checking formatting in CI, and running Prettier from your editor, many people like to run Prettier as a pre-commit hook as well. This makes sure your commits are formatted, without having to wait for your CI build to finish.

For example, you can add the following to your `package.json` to have ESLint and Prettier run before each commit via [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky).

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "**/*": ["eslint --fix", "prettier --write"]
  }
}
```

See [Pre-commit Hook](precommit.md) for more information.

To summarize, we have learned to:

- Install an exact version of Prettier locally in your project. This makes sure that everyone in the project gets the exact same version of Prettier. Even a patch release of Prettier can result in slightly different formatting, so you wouldn’t want different team members using different versions and formatting each other’s changes back and forth.
- Add a `.prettierrc.json` to let your editor know that you are using Prettier, and a `.prettierignore` to let your editor know which files _not_ to touch as well as for being able to run `prettier --write .` to format the entire project (without mangling files you don’t want, or choking on generated files).
- Run `prettier --check .` in CI to make sure that your project stays formatted.
- Run Prettier from your editor for the best experience.
- Use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to make Prettier and ESLint play nice together.
- Set up a pre-commit hook to make sure that every commit is formatted.
