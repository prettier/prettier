# Prettier

[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/jlongster/prettier)
[![Build Status](https://travis-ci.org/prettier/prettier.svg?branch=master)](https://travis-ci.org/prettier/prettier)
[![NPM version](https://img.shields.io/npm/v/prettier.svg)](https://www.npmjs.com/package/prettier)

<details>
<summary><strong>Table of Contents</strong></summary>

- [Usage](#usage)
  * [CLI](#cli)
    + [Pre-commit hook for changed files](#pre-commit-hook-for-changed-files)
  * [API](#api)
  * [Options](#options)
  * [Excluding code from formatting](#excluding-code-from-formatting)
- [Editor Integration](#editor-integration)
  * [Atom](#atom)
  * [Emacs](#emacs)
  * [Vim](#vim)
    + [Other `autocmd` events](#other-autocmd-events)
    + [Customizing Prettier in Vim](#customizing-prettier-in-vim)
    + [Running Prettier manually in Vim](#running-prettier-manually-in-vim)
  * [Visual Studio Code](#visual-studio-code)
  * [Visual Studio](#visual-studio)
  * [Sublime Text](#sublime-text)
  * [WebStorm](#webstorm)
- [Language Support](#language-support)
- [Related Projects](#related-projects)
- [Technical Details](#technical-details)
- [Badge](#badge)
- [Contributing](#contributing)
</details>

--------------------------------------------------------------------------------

Prettier is an opinionated code formatter inspired by
[refmt](https://facebook.github.io/reason/tools.html) with advanced
support for language features from:
* JavaScript, including [ES2017](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
* [JSX](https://facebook.github.io/jsx/)
* [Flow](https://flow.org/)
* [TypeScript](https://www.typescriptlang.org/)
* CSS, [LESS](http://lesscss.org/), and [SCSS](http://sass-lang.com)

It removes all original styling[\*](#styling-footnote) and ensures that all outputted code
conforms to a consistent style. (See this [blog post](http://jlongster.com/A-Prettier-Formatter))

If you are interested in the details, you can watch those two conference talks:

<a href="https://www.youtube.com/watch?v=hkfBvpEfWdA"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886367/dda8a6f0-1e08-11e7-865b-22492450f10f.png"></a> <a href="https://www.youtube.com/watch?v=0Q4kUNx85_4"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886368/ddacd6f8-1e08-11e7-806a-9febd23cbf47.png"></a>

In the case of JavaScript, this goes way beyond [ESLint](http://eslint.org/) and other projects
[built on it](https://github.com/feross/standard). Unlike ESLint,
there aren't a million configuration options and rules. But more
importantly: **everything is fixable**. This works because Prettier
never "checks" anything; it takes JavaScript as input and delivers the
formatted JavaScript as output.

In technical terms: Prettier parses your JavaScript into an AST (Abstract Syntax Tree) and
pretty-prints the AST, completely ignoring any of the original
formatting[\*](#styling-footnote). Say hello to completely consistent syntax!

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

Even if we disregard line lengths, it's too easy to sneak in various
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

Prettier bans all custom styling[\*](#styling-footnote) by parsing it away and re-printing
the parsed AST with its own rules that take the maximum line length
into account, wrapping code when necessary.

<a href="#styling-footnote" name="styling-footnote">\*</a>_Well actually, some
original styling is preserved when practical—see [empty lines] and [multi-line
objects]._

[empty lines]:Rationale.md#empty-lines
[multi-line objects]:Rationale.md#multi-line-objects

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

If you're worried that Prettier will change the correctness of your code, add `--debug-check` to the command.
This will cause Prettier to print an error message if it detects that code correctness might have changed.
Note that `--write` cannot be used with `--debug-check`.

Another useful flag is `--list-different` (or `-l`) which prints the filenames of files that are different from Prettier formatting. If there are differences the script errors out, which is useful in a CI scenario.

```bash
prettier --single-quote --list-different "src/**/*.js"
```

#### Pre-commit hook for changed files

You can use this with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add`  before you commit.

##### 1. [lint-staged](https://github.com/okonet/lint-staged)

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


##### 2. [pre-commit](https://github.com/pre-commit/pre-commit)

Copy the following config in your pre-commit config yaml file:

```yaml

    -   repo: https://github.com/awebdeveloper/pre-commit-prettier
        sha: ''  # Use the sha or tag you want to point at
        hooks:
        -   id: prettier
            additional_dependencies: ['prettier@1.4.2']

 ```

Find more info from [here](https://github.com/awebdeveloper/pre-commit-prettier).

##### 3. bash script

Alternately you can save this script as `.git/hooks/pre-commit` and give it execute permission:

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

The API has three functions, exported as `format`, `check`, and `formatWithCursor`. `format` usage is as follows:

```js
const prettier = require("prettier");

const options = {} // optional
prettier.format(source, options);
```

`check` checks to see if the file has been formatted with Prettier given those options and returns a Boolean.
This is similar to the `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

`formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code.
This is useful for editor integrations, to prevent the cursor from moving when code is formatted. For example:

```js
const prettier = require("prettier");

prettier.formatWithCursor(" 1", { cursorOffset: 2 });
// -> { formatted: '1;\n', cursorOffset: 1 }
```

### Options

Prettier ships with a handful of customizable format options, usable in both the CLI and API.

| Option | Default | CLI override | API override |
| ------------- | ------------- | ------------- | ------------- |
| **Print Width** - Specify the length of line that the printer will wrap on.<br /><br /><strong>We strongly recommend against using more than 80 columns</strong>. Prettier works by craming as much content as possible until it reaches the limit, which happens to work well for 80 columns but makes lines that are very crowded. When a bigger column count is used in styleguides, it usually means that code is allowed to go beyond 80 columns, but not to make every single line go there, like prettier would do.  | `80` | `--print-width <int>`  | `printWidth: <int>`
| **Tab Width** - Specify the number of spaces per indentation-level. | `2` | `--tab-width <int>` | `tabWidth: <int>` |
| **Tabs** - Indent lines with tabs instead of spaces. | `false` | `--use-tabs` | `useTabs: <bool>` |
| **Semicolons** - Print semicolons at the ends of statements.<br /><br />Valid options: <br /> - `true` - add a semicolon at the end of every statement <br /> - `false` - only add semicolons at the beginning of lines that may introduce ASI failures | `true` | `--no-semi` | `semi: <bool>` |
| **Quotes** - Use single quotes instead of double quotes.<br /><br />Notes:<br /> - Quotes in JSX will always be double and ignore this setting. <br /> - If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`. | `false` | `--single-quote` | `singleQuote: <bool>` |
| **Trailing Commas** - Print trailing commas wherever possible.<br /><br />Valid options: <br /> - `"none"` - no trailing commas <br /> - `"es5"` - trailing commas where valid in ES5 (objects, arrays, etc) <br /> - `"all"`  - trailing commas wherever possible (function arguments). This requires node 8 or a [transform](https://babeljs.io/docs/plugins/syntax-trailing-function-commas/). | `"none"` | <code>--trailing-comma <none&#124;es5&#124;all></code> | <code>trailingComma: "<none&#124;es5&#124;all>"</code> |
| **Bracket Spacing** - Print spaces between brackets in object literals.<br /><br />Valid options: <br /> - `true` - Example: `{ foo: bar }` <br /> - `false` - Example: `{foo: bar}` | `true` | `--no-bracket-spacing` | `bracketSpacing: <bool>` |
| **JSX Brackets on Same Line** - Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line | `false` | `--jsx-bracket-same-line` | `jsxBracketSameLine: <bool>` |
| **Cursor Offset** - Specify where the cursor is. This option only works with `prettier.formatWithCursor`, and cannot be used with `rangeStart` and `rangeEnd`. | `-1` | `--cursor-offset <int>` | `cursorOffset: <int>` |
| **Range Start** - Format code starting at a given character offset. The range will extend backwards to the start of the first line containing the selected statement. This option cannot be used with `cursorOffset`. | `0` | `--range-start <int>` | `rangeStart: <int>` |
| **Range End** - Format code ending at a given character offset (exclusive). The range will extend forwards to the end of the selected statement. This option cannot be used with `cursorOffset`. | `Infinity` | `--range-end <int>` | `rangeEnd: <int>` |
| **Parser** - Specify which parser to use. Both the `babylon` and `flow` parsers support the same set of JavaScript features (including Flow). Prettier automatically infers the parser from the input file path, so you shouldn't have to change this setting. | `babylon` | <code>--parser <flow&#124;babylon&#124;typescript&#124;postcss></code> | <code>parser: "<flow&#124;babylon&#124;typescript&#124;postcss>"</code> |
| **Filepath** - Specify the input filepath this will be used to do parser inference.<br /><br /> Example: <br />`cat foo \| prettier --stdin-filepath foo.css`<br /> will default to use `postcss` parser |  | `--stdin-filepath` | `filepath: <string>` |

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

Emacs users should see [this repository](https://github.com/prettier/prettier-emacs)
for on-demand formatting.

### Vim

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
autocmd FileType javascript setlocal formatprg=prettier\ --stdin\ --parser\ flow\ --single-quote\ --trailing-comma\ es5
" Use formatprg when available
let g:neoformat_try_formatprg = 1
```

Each option needs to be escaped with `\`.

#### Running Prettier manually in Vim

If you need a little more control over when prettier is run, you can create a
custom key binding. In this example, `gp` (mnemonic: "get pretty") is used to
run prettier (with options) in the currently active buffer:

```vim
nnoremap gp :silent %!prettier --stdin --trailing-comma all --single-quote<CR>
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

### WebStorm

See the [WebStorm
guide](https://github.com/jlongster/prettier/tree/master/editors/webstorm/README.md).

## Language Support

Prettier attempts to support all JavaScript language features,
including non-standardized ones. By default it uses the
[Babylon](https://github.com/babel/babylon) parser with all language
features enabled, but you can also use the
[Flow](https://github.com/facebook/flow) parser with the
`parser` API or `--parser` CLI [option](#options).

All of JSX and Flow syntax is supported. In fact, the test suite in
`tests` *is* the entire Flow test suite and they all pass.

Prettier also supports [TypeScript](https://www.typescriptlang.org/), CSS, [LESS](http://lesscss.org/), and [SCSS](http://sass-lang.com).

## Related Projects

- [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) plugs Prettier into your ESLint workflow
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
- [`Prettier Bookmarklet`](https://prettier.glitch.me/) provides a bookmarklet and exposes a REST API for Prettier that allows to format CodeMirror editor in your browser

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

## Badge

Show the world you're using *Prettier* → [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

```md
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
