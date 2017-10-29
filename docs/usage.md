---
id: usage
title: Usage
---

<!-- AUTO-GENERATED-CONTENT:START (PRETTIER_DOCS:id=usage) -->


Install:

```
yarn add prettier --dev --exact
```

You can install it globally if you like:

```
yarn global add prettier
```

*We're using `yarn` but you can use `npm` if you like:*

```
npm install --save-dev --save-exact prettier
# or globally
npm install --global prettier
```

> We recommend pinning an exact version of prettier in your `package.json`
> as we introduce stylistic changes in patch releases.

## CLI

Run Prettier through the CLI with this script. Run it without any
arguments to see the [options](#options).

To format a file in-place, use `--write`. You may want to consider
committing your code before doing that, just in case.

```bash
prettier [opts] [filename ...]
```

In practice, this may look something like:

```bash
prettier --single-quote --trailing-comma es5 --write "{app,__{tests,mocks}__}/**/*.js"
```

Don't forget the quotes around the globs! The quotes make sure that Prettier
expands the globs rather than your shell, for cross-platform usage.
The [glob syntax from the glob module](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer)
is used.

Prettier CLI will ignore files located in `node_modules` directory. To opt-out from this behavior use `--with-node-modules` flag.

### `--debug-check`

If you're worried that Prettier will change the correctness of your code, add `--debug-check` to the command.
This will cause Prettier to print an error message if it detects that code correctness might have changed.
Note that `--write` cannot be used with `--debug-check`.

### `--find-config-path` and `--config`

If you are repeatedly formatting individual files with `prettier`, you will incur a small performance cost
when prettier attempts to look up a [configuration file](#configuration-file). In order to skip this, you may
ask prettier to find the config file once, and re-use it later on.

```bash
prettier --find-config-path ./my/file.js
./my/.prettierrc
```

This will provide you with a path to the configuration file, which you can pass to `--config`:

```bash
prettier --config ./my/.prettierrc --write ./my/file.js
```

You can also use `--config` if your configuration file lives somewhere where prettier cannot find it,
such as a `config/` directory.

If you don't have a configuration file, or want to ignore it if it does exist,
you can pass `--no-config` instead.

### `--ignore-path`

Path to a file containing patterns that describe files to ignore.  By default, prettier looks for `./.prettierignore`.

### `--require-pragma`

Require a special comment, called a pragma, to be present in the file's first docblock comment in order for prettier to format it.
```js
/**
 * @prettier
 */
```

Valid pragmas are `@prettier` and `@format`.

<!--
[h4] `--insert-pragma`

Insert a `@format` pragma to the top of formatted files when pragma is absent.
Works well when used in tandem with `--require-pragma`.
-->

### `--list-different`

Another useful flag is `--list-different` (or `-l`) which prints the filenames of files that are different from Prettier formatting. If there are differences the script errors out, which is useful in a CI scenario.

```bash
prettier --single-quote --list-different "src/**/*.js"
```

### `--no-config`

Do not look for a configuration file.  The default settings will be used.

### `--config-precedence`

Defines how config file should be evaluated in combination of CLI options.

**cli-override (default)**

CLI options take precedence over config file

**file-override**

Config file take precedence over CLI options

**prefer-file**

If a config file is found will evaluate it and ignore other CLI options. If no config file is found CLI options will evaluate as normal.

This option adds support to editor integrations where users define their default configuration but want to respect project specific configuration.

### `--with-node-modules`

Prettier CLI will ignore files located in `node_modules` directory. To opt-out from this behavior use `--with-node-modules` flag.

### `--write`

This rewrites all processed files in place.  This is comparable to the `eslint --fix` workflow.

## ESLint

If you are using ESLint, integrating Prettier to your workflow is straightforward:

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

We also recommend that you use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to disable all the existing formatting rules. It's a one liner that can be added on-top of any existing ESLint configuration.

```
$ yarn add --dev eslint-config-prettier
```

.eslintrc.json:

```json
{
  "extends": [
    "prettier"
  ]
}
```


## Pre-commit Hook

You can use Prettier with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add` before you commit.

#### Option 1. [lint-staged](https://github.com/okonet/lint-staged)

Install it along with [husky](https://github.com/typicode/husky):

```bash
yarn add lint-staged husky --dev
```

and add this config to your `package.json`:

```json
{
  "scripts": {
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,json,css}": [
      "prettier --write",
      "git add"
    ]
  }
}
```
There is a limitation where if you stage specific lines this approach will stage the whole file after regardless. See this [issue](https://github.com/okonet/lint-staged/issues/62) for more info.

See https://github.com/okonet/lint-staged#configuration for more details about how you can configure lint-staged.


#### Option 2. [pre-commit](https://github.com/pre-commit/pre-commit)

Copy the following config into your `.pre-commit-config.yaml` file:

```yaml

    -   repo: https://github.com/prettier/prettier
        sha: ''  # Use the sha or tag you want to point at
        hooks:
        -   id: prettier

```

Find more info from [here](http://pre-commit.com).

#### Option 3. bash script

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

## API

```js
const prettier = require("prettier");
```

### `prettier.format(source [, options])`

`format` is used to format text using Prettier. [Options](#options) may be provided to override the defaults.

```js
prettier.format("foo ( );", { semi: false });
// -> "foo()"
```

### `prettier.check(source [, options])`

`check` checks to see if the file has been formatted with Prettier given those options and returns a `Boolean`.
This is similar to the `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

### `prettier.formatWithCursor(source [, options])`

`formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code.
This is useful for editor integrations, to prevent the cursor from moving when code is formatted.

The `cursorOffset` option should be provided, to specify where the cursor is. This option cannot be used with `rangeStart` and `rangeEnd`.

```js
prettier.formatWithCursor(" 1", { cursorOffset: 2 });
// -> { formatted: '1;\n', cursorOffset: 1 }
```

### `prettier.resolveConfig(filePath [, options])`

`resolveConfig` can be used to resolve configuration for a given source file, passing its path as the first argument.
The config search will start at the file path and continue to search up the directory (you can use `process.cwd()` to start
searching from the current directory).
Or you can pass directly the path of the config file as `options.config` if you don't wish to search for it.
A promise is returned which will resolve to:
* An options object, providing a [config file](#configuration-file) was found.
* `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

If `options.useCache` is `false`, all caching will be bypassed.

```js
const text = fs.readFileSync(filePath, "utf8");
prettier.resolveConfig(filePath).then(options => {
  const formatted = prettier.format(text, options);
})
```

Use `prettier.resolveConfig.sync(filePath [, options])` if you'd like to use sync version.

### `prettier.clearConfigCache()`

As you repeatedly call `resolveConfig`, the file system structure will be cached for performance.
This function will clear the cache. Generally this is only needed for editor integrations that
know that the file system has changed since the last format took place.

### Custom Parser API

If you need to make modifications to the AST (such as codemods), or you want to provide an alternate parser, you can do so by setting the `parser` option to a function. The function signature of the parser function is:
```js
(text: string, parsers: object, options: object) => AST;
```

Prettier's built-in parsers are exposed as properties on the `parsers` argument.

```js
prettier.format("lodash ( )", {
  parser(text, { babylon }) {
    const ast = babylon(text);
    ast.program.body[0].expression.callee.name = "_";
    return ast;
  }
});
// -> "_();\n"
```

The `--parser` CLI option may be a path to a node.js module exporting a parse function.

## Excluding code from formatting

A JavaScript comment of `// prettier-ignore` will exclude the next node in the abstract syntax tree from formatting.

For example:

```js
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)

// prettier-ignore
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)
```

will be transformed to:

```js
matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

// prettier-ignore
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)
```

<!-- AUTO-GENERATED-CONTENT:END -->
