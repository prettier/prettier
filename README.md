# Prettier

[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/jlongster/prettier)
[![Build Status](https://travis-ci.org/prettier/prettier.svg?branch=master)](https://travis-ci.org/prettier/prettier)
[![NPM version](https://img.shields.io/npm/v/prettier.svg)](https://www.npmjs.com/package/prettier)

<!-- toc -->

- [Usage](#usage)
  * [CLI](#cli)
    + [Pre-commit hook for changed files](#pre-commit-hook-for-changed-files)
  * [API](#api)
  * [Excluding code from formatting](#excluding-code-from-formatting)
- [Editor Integration](#editor-integration)
  * [Atom](#atom)
  * [Emacs](#emacs)
  * [Vim](#vim)
    + [Vanilla approach](#vanilla-approach)
    + [Neoformat approach](#neoformat-approach)
    + [Customizing Prettier in Vim](#customizing-prettier-in-vim)
  * [Visual Studio Code](#visual-studio-code)
  * [Visual Studio](#visual-studio)
  * [Sublime Text](#sublime-text)
  * [JetBrains](#jetbrains)
- [Language Support](#language-support)
- [Related Projects](#related-projects)
- [Technical Details](#technical-details)
- [Badge](#badge)
- [Contributing](#contributing)

<!-- tocstop -->

Prettier is an opinionated JavaScript formatter inspired by
[refmt](https://facebook.github.io/reason/tools.html) with advanced
support for language features from [ES2017](https://github.com/tc39/proposals/blob/master/finished-proposals.md), [JSX](https://facebook.github.io/jsx/), and [Flow](https://flow.org/). It removes
all original styling and ensures that all outputted JavaScript
conforms to a consistent style. (See this [blog post](http://jlongster.com/A-Prettier-Formatter))

If you are interested in the details, you can watch those two conference talks:

<a href="https://www.youtube.com/watch?v=hkfBvpEfWdA"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886367/dda8a6f0-1e08-11e7-865b-22492450f10f.png"></a> <a href="https://www.youtube.com/watch?v=0Q4kUNx85_4"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886368/ddacd6f8-1e08-11e7-806a-9febd23cbf47.png"></a>

This goes way beyond [ESLint](http://eslint.org/) and other projects
[built on it](https://github.com/feross/standard). Unlike ESLint,
there aren't a million configuration options and rules. But more
importantly: **everything is fixable**. This works because Prettier
never "checks" anything; it takes JavaScript as input and delivers the
formatted JavaScript as output.

In technical terms: Prettier parses your JavaScript into an AST (Abstract Syntax Tree) and
pretty-prints the AST, completely ignoring any of the original
formatting. Say hello to completely consistent syntax!

There's an extremely important piece missing from existing styling
tools: **the maximum line length**. Sure, you can tell ESLint to warn
you when you have a line that's too long, but that's an after-thought
(ESLint *never* knows how to fix it). The maximum line length is a
critical piece the formatter needs for laying out and wrapping code.

For example, take the following code:

```js
foo(arg1, arg2, arg3, arg4);
```

That looks like the right way to format it. However, we've all run
into this situation:

```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

Suddenly our previous format for calling function breaks down because
this is too long. What you would probably do is this instead:

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

This clearly shows that the maximum line length has a direct impact on
the style of code we desire. The fact that current style tools ignore
this means they can't really help with the situations that are
actually the most troublesome. Individuals on teams will all format
these differently according to their own rules and we lose the
consistency we sought after.

Even if we disregard line widths, it's too easy to sneak in various
styles of code in all other linters. The most strict linter I know
happily lets all these styles happen:

```js
foo({ num: 3 },
  1, 2)

foo(
  { num: 3 },
  1, 2)

foo(
  { num: 3 },
  1,
  2
)
```

Prettier bans all custom styling by parsing it away and re-printing
the parsed AST with its own rules that take the maximum line width
into account, wrapping code when necessary.

## Usage

Install:

```
yarn add prettier --dev
```

You can install it globally if you like:

```
yarn global add prettier
```

*We're defaulting to `yarn` but you can use `npm` if you like:*

```
npm install [-g] prettier
```

### CLI

Run Prettier through the CLI with this script. Run it without any
arguments to see the options.

To format a file in-place, use `--write`. You may want to consider
committing your code before doing that, just in case.

```bash
prettier [opts] [filename ...]
```

In practice, this may look something like:

```bash
prettier --single-quote --trailing-comma es5 --write "{app,__{tests,mocks}__}/**/*.js"
```

(Don't forget the quotes around the globs! The quotes make sure that Prettier
expands the globs rather than your shell, for cross-platform usage.)

In the future we will have better support for formatting whole projects.

#### Pre-commit hook for changed files

[lint-staged](https://github.com/okonet/lint-staged) can re-format your files that are marked as "staged" via `git add`  before you commit.

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
    "*.js": [
      "prettier --write",
      "git add"
    ]
  }
}
```

See https://github.com/okonet/lint-staged#configuration for more details about how you can configure lint-staged.

Alternately you can just save this script as `.git/hooks/pre-commit` and give it execute permission:

```bash
#!/bin/sh
jsfiles=$(git diff --cached --name-only --diff-filter=ACM | grep '\.jsx\?$' | tr '\n' ' ')
[ -z "$jsfiles" ] && exit 0

diffs=$(node_modules/.bin/prettier -l $jsfiles)
[ -z "$diffs" ] && exit 0

echo "here"
echo >&2 "Javascript files must be formatted with prettier. Please run:"
echo >&2 "node_modules/.bin/prettier --write "$diffs""

exit 1
```

### API

The API has two functions, exported as `format` and `check`. The options
argument is optional, and all of the defaults are shown below:

```js
const prettier = require("prettier");

prettier.format(source, {
  // Indent lines with tabs
  useTabs: false,

  // Fit code within this line limit
  printWidth: 80,

  // Number of spaces it should use per tab
  tabWidth: 2,

  // If true, will use single instead of double quotes
  singleQuote: false,

  // Controls the printing of trailing commas wherever possible. Valid options:
  // "none" - No trailing commas
  // "es5"  - Trailing commas where valid in ES5 (objects, arrays, etc)
  // "all"  - Trailing commas wherever possible (function arguments)
  //
  // NOTE: Above is only available in 0.19.0 and above. Previously this was
  // a boolean argument.
  trailingComma: "none",

  // Controls the printing of spaces inside object literals
  bracketSpacing: true,

  // If true, puts the `>` of a multi-line jsx element at the end of
  // the last line instead of being alone on the next line
  jsxBracketSameLine: false,

  // Which parser to use. Valid options are "flow" and "babylon"
  parser: "babylon",

  // Whether to add a semicolon at the end of every line (semi: true),
  // or only at the beginning of lines that may introduce ASI failures (semi: false)
  semi: true
});
```

`check` checks to see if the file has been formatted with Prettier given those options and returns a Boolean.
This is similar to the `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

### Excluding code from formatting

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

## Editor Integration

### Atom

Atom users can simply install the [prettier-atom](https://github.com/prettier/prettier-atom) package and use
`Ctrl+Alt+F` to format a file (or format on save if enabled).

### Emacs

Emacs users should see [this directory](https://github.com/prettier/prettier/tree/master/editors/emacs)
for on-demand formatting.

### Vim

For Vim users, there are two main approaches: one that leans on [sbdchd](https://github.com/sbdchd)/[neoformat](https://github.com/sbdchd/neoformat), which has the advantage of leaving the cursor in the same position despite changes, or a vanilla approach which can only approximate the cursor location, but might be good enough for your needs.

#### Vanilla approach

Vim users can add the following to their `.vimrc`:

```vim
autocmd FileType javascript set formatprg=prettier\ --stdin
```

If you use the [vim-jsx](https://github.com/mxw/vim-jsx) plugin without
requiring the `.jsx` file extension (See https://github.com/mxw/vim-jsx#usage),
the FileType needs to include `javascript.jsx`:

```vim
autocmd FileType javascript.jsx,javascript setlocal formatprg=prettier\ --stdin
```

This makes Prettier power the [`gq` command](http://vimdoc.sourceforge.net/htmldoc/change.html#gq)
for automatic formatting without any plugins. You can also add the following to your
`.vimrc` to run Prettier when `.js` files are saved:

```vim
autocmd BufWritePre *.js :normal gggqG
```

If you want to restore cursor position after formatting, try this
(although it's not guaranteed that it will be restored to the same
place in the code since it may have moved):

```vim
autocmd BufWritePre *.js exe "normal! gggqG\<C-o>\<C-o>"
```

#### Neoformat approach

Add [sbdchd](https://github.com/sbdchd)/[neoformat](https://github.com/sbdchd/neoformat) to your list based on the tool you use:

```vim
Plug 'sbdchd/neoformat'
```

Then make Neoformat run on save:

```vim
autocmd BufWritePre *.js Neoformat
```

#### Other `autocmd` events

You can also make Vim format your code more frequently, by setting an `autocmd` for other events. Here are a couple of useful ones:

* `TextChanged`: after a change was made to the text in Normal mode
* `InsertLeave`: when leaving Insert mode

For example, you can format on both of the above events together with `BufWritePre` like this:

```vim
autocmd BufWritePre,TextChanged,InsertLeave *.js Neoformat
```

See `:help autocmd-events` in Vim for details.

#### Customizing Prettier in Vim

If your project requires settings other than the default Prettier settings, you can pass arguments to do so in your `.vimrc` or [vim project](http://vim.wikia.com/wiki/Project_specific_settings), you can do so:

```vim
autocmd FileType javascript set formatprg=prettier\ --stdin\ --parser\ flow\ --single-quote\ --trailing-comma\ es5
```

Each command needs to be escaped with `\`. If you are using Neoformat and you want it to recognize your formatprg settings you can also do that by adding the following to your `.vimrc`:

```vim
" Use formatprg when available
let g:neoformat_try_formatprg = 1
```

### Visual Studio Code

Can be installed using the extension sidebar. Search for `Prettier - JavaScript formatter`.

Can also be installed using `ext install prettier-vscode`.

[Check its repository for configuration and shortcuts](https://github.com/esbenp/prettier-vscode)

### Visual Studio

Install the [JavaScript Prettier extension](https://github.com/madskristensen/JavaScriptPrettier).

### Sublime Text

Sublime Text support is available through Package Control and
the [JsPrettier](https://packagecontrol.io/packages/JsPrettier) plug-in.

### JetBrains

JetBrains users can configure `prettier` as an **External Tool**.
See [this blog post](https://blog.jetbrains.com/webstorm/2016/08/using-external-tools/) or [this
directory](https://github.com/jlongster/prettier/tree/master/editors/jetbrains) with examples.

More editors are coming soon.

## Language Support

Prettier attempts to support all JavaScript language features,
including non-standardized ones. By default it uses the
[Babylon](https://github.com/babel/babylon) parser with all language
features enabled, but you can also use the
[Flow](https://github.com/facebook/flow) parser with the
`parser` API or `--parser` CLI option.

All of JSX and Flow syntax is supported. In fact, the test suite in
`tests` *is* the entire Flow test suite and they all pass.

## Related Projects

- [`eslint-plugin-prettier`](https://github.com/not-an-aardvark/eslint-plugin-prettier) plugs Prettier into your ESLint workflow
- [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) turns off all ESLint rules that are unnecessary or might conflict with Prettier
- [`prettier-eslint`](https://github.com/prettier/prettier-eslint)
passes `prettier` output to `eslint --fix`
- [`prettier-standard`](https://github.com/sheerun/prettier-standard)
uses `prettier` and `prettier-eslint` to format code with standard rules
- [`prettier-standard-formatter`](https://github.com/dtinth/prettier-standard-formatter)
passes `prettier` output to `standard --fix`
- [`prettier-miscellaneous`](https://github.com/arijs/prettier-miscellaneous)
`prettier` with a few minor extra options
- [`neutrino-preset-prettier`](https://github.com/SpencerCDixon/neutrino-preset-prettier) allows you to use Prettier as a Neutrino preset
- [`prettier_d`](https://github.com/josephfrazier/prettier_d.js) runs Prettier as a server to avoid Node.js startup delay


## Technical Details

This printer is a fork of
[recast](https://github.com/benjamn/recast)'s printer with its
algorithm replaced by the one described by Wadler in "[A prettier
printer](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)".
There still may be leftover code from recast that needs to be cleaned
up.

The basic idea is that the printer takes an AST and returns an
intermediate representation of the output, and the printer uses that
to generate a string. The advantage is that the printer can "measure"
the IR and see if the output is going to fit on a line, and break if
not.

This means that most of the logic of printing an AST involves
generating an abstract representation of the output involving certain
commands. For example, `concat(["(", line, arg, line ")"])` would
represent a concatentation of opening parens, an argument, and closing
parens. But if that doesn't fit on one line, the printer can break
where `line` is specified.

More (rough) details can be found in [commands.md](commands.md).
Better docs will come soon.

## Badge

Show the world you're using *Prettier* → [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

```md
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
```

## Contributing

To get up and running, install the dependencies and run the tests:

```
yarn
yarn test
```

Here's what you need to know about the tests:

* The tests uses [Jest](https://facebook.github.io/jest/) snapshots.
* You can make changes and run `jest -u` (or `yarn test -- -u`) to update the
  snapshots. Then run `git diff` to take a look at what changed. Always update
  the snapshots when opening a PR.
* You can run `AST_COMPARE=1 jest` for a more robust test run. That formats each
  file, re-parses it, and compares the new AST with the original one and makes
  sure they are semantically equivalent.
* Each test folder has a `jsfmt.spec.js` that runs the tests. Normally you can
  just put `run_spec(__dirname);` there. You can also pass options and
  additional parsers, like this:
  `run_spec(__dirname, { trailingComma: "es5" }, ["babylon"]);`
* `tests/flow/` contains the Flow test suite, and is not supposed to be edited
  by hand. To update it, clone the Flow repo next to the Prettier repo and run:
  `node scripts/sync-flow-tests.js ../flow/tests/`.
* If you would like to debug prettier locally, you can either debug it in node
  or the browser. The easiest way to debug it in the browser is to run the
  interactive `docs` REPL locally. The easiest way to debug it in node, is to
  create a local test file and run it in an editor like VS Code.

If you can, take look at [commands.md](commands.md) and check out [Wadler's
paper](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf) to
understand how Prettier works.
