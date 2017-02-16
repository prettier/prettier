# Prettier

[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/jlongster/prettier)
[![Build Status](https://travis-ci.org/jlongster/prettier.svg?branch=master)](https://travis-ci.org/jlongster/prettier)
[![NPM version](https://img.shields.io/npm/v/prettier.svg)](https://www.npmjs.com/package/prettier)

Prettier is an opinionated JavaScript formatter inspired by
[refmt](https://facebook.github.io/reason/tools.html) with advanced
support for language features from ES2017, JSX, and Flow. It removes
all original styling and ensures that all outputted JavaScript
conforms to a consistent style. (See this [blog post](http://jlongster.com/A-Prettier-Formatter))

*Warning*: This is a beta, and the format may change over time. If you
 aren't OK with the format changing, wait for a more stable version.

This goes way beyond [eslint](http://eslint.org/) and other projects
[built on it](https://github.com/feross/standard). Unlike eslint,
there aren't a million configuration options and rules. But more
importantly: **everything is fixable**. This works because prettier
never "checks" anything; it takes JavaScript as input and outputs the
formatted JavaScript as output.

In technical terms: prettier parses your JavaScript into an AST and
pretty-prints the AST, completely ignoring any of the original
formatting. Say hello to completely consistent syntax!

There's an extremely important piece missing from existing styling
tools: **the maximum line length**. Sure, you can tell eslint to warn
you when you have a line that's too long, but that's an after-thought
(eslint *never* knows how to fix it). The maximum line length is a
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
yarn add prettier
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

Run prettier through the CLI with this script. Run it without any
arguments to see the options.

To format a file in-place, use `--write`. While this is in beta you
should probably commit your code before doing that.

```js
prettier [opts] [filename ...]
```

For easier cross-platform usage, prettier has built-in glob support:
```bash
prettier --write 'src/**/*.js' 'bin/*.js'
```

In the future we will have better support for formatting whole projects.

#### Pre-commit hook for changed files

[🚫💩 lint-staged](https://github.com/okonet/lint-staged) can re-format your files that are marked as "staged" via `git add`  before you commit.

Install it along with [pre-commit](https://github.com/observing/pre-commit) (or [husky](https://github.com/typicode/husky)):

```bash
npm install --save-dev lint-staged pre-commit
```

and add this config to your `package.json`:

```json
{
  "scripts": {
    "lint:staged": "lint-staged"
  },
  "lint-staged": {
    "*.js": [
      "prettier --write",
      "git add"
    ]
  },
  "pre-commit": "lint:staged"
}
```


### API

The API is a single function exported as `format`. The options
argument is optional, and all of the defaults are shown below:

```js
const prettier = require("prettier");

prettier.format(source, {
  // Fit code within this line limit
  printWidth: 80,

  // Number of spaces it should use per tab
  tabWidth: 2,

  // If true, will use single instead of double quotes
  singleQuote: false,

  // Controls the printing of trailing commas wherever possible
  trailingComma: false,

  // Controls the printing of spaces inside object literals
  bracketSpacing: true,

  // If true, puts the `>` of a multi-line jsx element at the end of
  // the last line instead of being alone on the next line
  jsxBracketSameLine: false,

  // Which parser to use. Valid options are 'flow' and 'babylon'
  parser: 'babylon'
});
```

### Atom

Atom users can simply install the `prettier-atom` package and use
ctrl+alt+f to format a file (or format on save if turned on).

### Emacs

Emacs users should see [this
folder](https://github.com/jlongster/prettier/tree/master/editors/emacs)
for on-demand formatting.

### Vim

Vim users can add the following to their `.vimrc`:

```
autocmd FileType javascript set formatprg=prettier\ --stdin
```

This makes Prettier power the [`gq` command](http://vimdoc.sourceforge.net/htmldoc/change.html#gq)
for automatic formatting without any plugins. You can also add the following to your
`.vimrc` to run prettier when `.js` files are saved:

```
autocmd BufWritePre *.js :normal gggqG
```

If you want to restore cursor position after formatting, try this
(although it's not guaranteed that it will be restored to the same
place in the code since it may have moved):

```
autocmd BufWritePre *.js exe "normal! gggqG\<C-o>\<C-o>"
```

### Visual Studio Code

Can be installed using the extension sidebar. Search for `Prettier - JavaScript formatter`

Can also be installed using `ext install prettier-vscode`

[Check repository for configuration and shortcuts](https://github.com/esbenp/prettier-vscode)

### Visual Studio

Install the [JavaScript Prettier extension](https://github.com/madskristensen/JavaScriptPrettier)

### Sublime Text

Sublime Text support is available through Package Control and
the [JsPrettier](https://packagecontrol.io/packages/JsPrettier) plug-in.

### JetBrains

JetBrains users can configure `prettier` as an **External Tool** see [this
blog post](https://blog.jetbrains.com/webstorm/2016/08/using-external-tools/) or [this
directory](https://github.com/jlongster/prettier/tree/master/editors/jetbrains) with examples.

More editors are coming soon.

## Language Support

Prettier attempts to support all JavaScript language features,
including non-standardized ones. By default it uses the
[babylon](https://github.com/babel/babylon) parser with all language
features enabled, but you can also use
[flow](https://github.com/facebook/flow) parser with the
`parser` API or `--parser` CLI option.

All of JSX and Flow syntax is supported. In fact, the test suite in
`tests` *is* the entire Flow test suite and they all pass.

## Related Projects

- [`eslint-plugin-prettier`](https://github.com/not-an-aardvark/eslint-plugin-prettier) plugs `prettier` into your `eslint` workflow
- [`eslint-config-prettier`](https://github.com/lydell/eslint-config-prettier) turns all `eslint` rules that are unnecessary or might conflict with prettier off
- [`prettier-eslint`](https://github.com/kentcdodds/prettier-eslint)
passes `prettier` output to `eslint --fix`
- [`prettier-standard-formatter`](https://github.com/dtinth/prettier-standard-formatter)
passes `prettier` output to `standard --fix`
- [`prettier-with-tabs`](https://github.com/arijs/prettier-with-tabs)
allows you to configure prettier to use `tabs`


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

## Contributing

We will work on better docs over time, but in the mean time, here are
a few notes if you are interested in contributing:

* You should be able to get up and running with just `yarn`
* This uses jest snapshots for tests. The entire Flow test suite is
  included here and you can make changes and run `jest -u` and then
  `git diff` to see the styles that changed. Always update the
  snapshots if opening a PR.
* If you can, look at [commands.md](commands.md) and check out
  [Wadler's
  paper](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)
  to understand how this works. I will try to write a better explanation soon.
* I haven't set up any automated tests yet, but for now as long as you
  run `jest -u` to update the snapshots and I see them in the PR, that's fine.
* You can run `AST_COMPARE=1 jest` for a more robust test run. That
  formats each file, re-parses it, and compares the new AST with the
  original one and makes sure they are semantically equivalent.
 * Each test folder has a `jsfmt.spec.js` that runs the tests. Normally you can just put `run_spec(__dirname);` there but if you want to pass specific options you can add the options object as the 2nd parameter like: `run_spec(__dirname, { parser: 'babylon' });`
