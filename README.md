# Prettier

[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/jlongster/prettier)
[![Build Status](https://travis-ci.org/prettier/prettier.svg?branch=master)](https://travis-ci.org/prettier/prettier)
[![NPM version](https://img.shields.io/npm/v/prettier.svg)](https://www.npmjs.com/package/prettier)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Prettier is an opinionated code formatter with support for:
* JavaScript, including [ES2017](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
* [JSX](https://facebook.github.io/jsx/)
* [Flow](https://flow.org/)
* [TypeScript](https://www.typescriptlang.org/)
* CSS, [LESS](http://lesscss.org/), and [SCSS](http://sass-lang.com)

It removes all original styling[\*](#styling-footnote) and ensures that all outputted code
conforms to a consistent style. (See this [blog post](http://jlongster.com/A-Prettier-Formatter))

## What does prettier do?

Prettier takes your code and reprints it from scratch by taking into account the line length.

For example, take the following code:

```js
foo(arg1, arg2, arg3, arg4);
```

It fits in a single line so it's going to stay as is. However, we've all run into this situation:

```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

Suddenly our previous format for calling function breaks down because this is too long. Prettier is going to do the painstaking work of reprinting it like that for you:

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

Prettier enforces a consistent code **style** (i.e. code formatting that won't affect the AST) across your entire codebase because it disregards the original styling[\*](#styling-footnote) by parsing it away and re-printing the parsed AST with its own rules that take the maximum line length
into account, wrapping code when necessary.

<a href="#styling-footnote" name="styling-footnote">\*</a>_Well actually, some
original styling is preserved when practical—see [empty lines] and [multi-line
objects]._

[empty lines]:Rationale.md#empty-lines
[multi-line objects]:Rationale.md#multi-line-objects

If you want to learn more, those two conference talks are a great introduction:

<a href="https://www.youtube.com/watch?v=hkfBvpEfWdA"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886367/dda8a6f0-1e08-11e7-865b-22492450f10f.png"></a> <a href="https://www.youtube.com/watch?v=0Q4kUNx85_4"><img width="298" src="https://cloud.githubusercontent.com/assets/197597/24886368/ddacd6f8-1e08-11e7-806a-9febd23cbf47.png"></a>


## Why Prettier?

### Building and enforcing a style guide

By far the biggest reason for adopting prettier is to stop all the ongoing debates over styles. It is generally accepted that having a common style guide is valuable for a project & team but getting there is a very painful and unrewarding process. People get very emotional around particular ways of writing code and nobody likes spending time writing and receiving nits.
- “We want to free mental threads and end discussions around style. While sometimes fruitful, these discussions are for the most part wasteful.”
- “Literally had an engineer go through a huge effort of cleaning up all of our code because we were debating ternary style for the longest time and were inconsistent about it. It was dumb, but it was a weird on-going "great debate" that wasted lots of little back and forth bits. It's far easier for us all to agree now: just run prettier, and go with that style.”
- “Getting tired telling people how to style their product code.”
- “Our top reason was to stop wasting our time debating style nits.”
- “Having a githook set up has reduced the amount of style issues in PRs that result in broken builds due to ESLint rules or things I have to nit-pick or clean up later.”
- “I don't want anybody to nitpick any other person ever again.”
- “It reminds me of how Steve Jobs used to wear the same clothes every day because he has a million decisions to make and he didn't want to be bothered to make trivial ones like picking out clothes. I think Prettier is like that.”

### Helping Newcomers

Prettier is usually introduced by people with experience in the current codebase and JavaScript but the people that disproportionally benefit from it are newcomers to the codebase. One may think that it's only useful for people with very limited programming experience, but we've seen it quicken the ramp up time from experienced engineers joining the company, as they likely used a different coding style before, and developers coming from a different programming language.
- “My motivations for using Prettier are: appearing that I know how to write JavaScript well.”
- “I always put spaces in the wrong place, now I don't have to worry about it anymore.”
- “When you're a beginner you're making a lot of mistakes caused by the syntax. Thanks to Prettier, you can reduce these mistakes and save a lot of time to focus on what really matters.”
- “As a teacher, I will also tell to my students to install Prettier to help them to learn the JS syntax and have readable files.”

### Writing code

What usually happens once people are using prettier is that they realize that they actually spend a lot of time and mental energy formatting their code. With prettier editor integration, you can just press that magic key binding and poof, the code is formatted. This is an eye opening experience if anything else.
- “I want to write code. Not spend cycles on formatting.”
- “It removed 5% that sucks in our daily life - aka formatting”
- “We're in 2017 and it's still painful to break a call into multiple lines when you happen to add an argument that makes it go over the 80 columns limit :(“

### Easy to adopt

We've worked very hard to use the least controversial coding styles, went through many rounds of fixing all the edge cases and polished the getting started experience. When you're ready to push prettier into your codebase, not only should it be painless for you to do it technically but the newly formatted codebase should not generate major controversy and be accepted painlessly by your co-workers.
- “It's low overhead. We were able to throw Prettier at very different kinds of repos without much work.”
- “It's been mostly bug free. Had there been major styling issues during the course of implementation we would have been wary about throwing this at our JS codebase. I'm happy to say that's not the case.”
- “Everyone runs it as part of their pre commit scripts, a couple of us use the editor on save extensions as well.”
- “It's fast, against one of our larger JS codebases we were able to run Prettier in under 13 seconds.”
- “The biggest benefit for prettier for us was being able to format the entire code base at once.”

### Clean up an existing codebase

Since coming up with a coding style and enforcing it is a big undertaking, it often slips through the cracks and you are left working on inconsistent codebases. Running prettier in this case is a quick win, the codebase is now uniform and easier to read without spending hardly any time.
- “Take a look at the code :) I just need to restore sanity.”
- “We inherited a ~2000 module ES6 code base, developed by 20 different developers over 18 months, in a global team. Felt like such a win without much research.

### Ride the hype train

Purely technical aspects of the projects aren't the only thing people look into when choosing to adopt prettier. Who built and uses it and how quickly it spreads through the community have a non trivial impact.
- “The amazing thing, for me, is: 1) Announced 2 months ago. 2) Already adopted by, it seems, every major JS project. 3) 7000 stars, 100,000 npm downloads/mo”
- “Was built by the same people as React & React Native.”
- “I like to be part of the hot new things.”
- “Because soon enough people are gonna ask for it.”

A few of the [many projects](https://www.npmjs.com/browse/depended/prettier) using Prettier:

<table>
<tr>
<td><p align="center"><a href="https://facebook.github.io/react/"><img src="images/react-200x100.png" alt="React" width="200" height="100"><br>React</a></p></td>
<td><p align="center"><a href="https://facebook.github.io/jest/"><img src="images/jest-200x100.png" alt="Jest" width="200" height="100"><br>Jest</a></p></td>
<td><p align="center"><a href="https://yarnpkg.com"><img src="images/yarn-200x100.png" alt="Yarn" width="200" height="100"><br>Yarn</a></p></td>
</tr>
<tr>
<td><p align="center"><a href="https://babeljs.io/"><img src="images/babel-200x100.png" alt="Babel" width="200" height="100"><br>Babel</a></p></td>
<td><p align="center"><a href="https://zeit.co/"><img src="images/zeit-200x100.png" alt="Zeit" width="200" height="100"><br>Zeit</a></p></td>
<td><p align="center"><a href="https://webpack.js.org/api/cli/"><img src="images/webpack-200x100.png" alt="Webpack-cli" width="200" height="100"><br>Webpack-cli</a></p></td>
</tr>
</table>


## How does it compare to ESLint (or TSLint, stylelint...)?

Linters have two categories of rules:

**Formatting rules**: eg: [max-len](http://eslint.org/docs/rules/max-len), [no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs), [keyword-spacing](http://eslint.org/docs/rules/keyword-spacing), [comma-style](http://eslint.org/docs/rules/comma-style)...

Prettier makes this whole category of rules not needed anymore! Prettier is going to reprint the entire program from scratch in a consistent way, so it's not possible for the programmer to make a mistake there anymore :)

**Code-quality rules**: eg [no-unused-vars](http://eslint.org/docs/rules/no-unused-vars), [no-extra-bind](http://eslint.org/docs/rules/no-extra-bind), [no-implicit-globals](http://eslint.org/docs/rules/no-implicit-globals), [prefer-promise-reject-errors](http://eslint.org/docs/rules/prefer-promise-reject-errors)...

Prettier does nothing to help with those kind of rules. They are also the most important ones provided by linters as they are likely to catch real bugs with your code!


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

### ESlint

If you are using ESLint, integrating prettier to your workflow is straightforward:

Just add prettier as an eslint rule using [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier).

```js
yarn add --dev prettier eslint-plugin-prettier

// .eslintrc
{
  "plugins": [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

We also recommend that you use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to disable all the existing formatting rules. It's a one liner that can be added on-top of any existing eslint configuration.

```js
$ yarn add --dev eslint-config-prettier

// .eslintrc
{
  "extends": [
    "prettier"
  ]
}
```


### Pre-commit Hook

You can use prettier with a pre-commit tool. This can re-format your files that are marked as "staged" via `git add` before you commit.

##### Option 1. [lint-staged](https://github.com/okonet/lint-staged)

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


##### Option 2. [pre-commit](https://github.com/pre-commit/pre-commit)

Copy the following config in your pre-commit config yaml file:

```yaml

    -   repo: https://github.com/awebdeveloper/pre-commit-prettier
        sha: ''  # Use the sha or tag you want to point at
        hooks:
        -   id: prettier
            additional_dependencies: ['prettier@1.4.2']

 ```

Find more info from [here](https://github.com/awebdeveloper/pre-commit-prettier).

##### Option 3. bash script

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


### Options

Prettier ships with a handful of customizable format options, usable in both the CLI and API.

| Option | Default | Override |
| ------ | ------- | -------- |
| **Print Width** - Specify the length of line that the printer will wrap on.<br /><br /><strong>We strongly recommend against using more than 80 columns</strong>. Prettier works by cramming as much content as possible until it reaches the limit, which happens to work well for 80 columns but makes lines that are very crowded. When a bigger column count is used in styleguides, it usually means that code is allowed to go beyond 80 columns, but not to make every single line go there, like prettier would do.  | `80` | CLI: `--print-width <int>` <br />API: `printWidth: <int>`
| **Tab Width** - Specify the number of spaces per indentation-level. | `2` | CLI: `--tab-width <int>` <br />API: `tabWidth: <int>` |
| **Tabs** - Indent lines with tabs instead of spaces. | `false` | CLI: `--use-tabs` <br />API: `useTabs: <bool>` |
| **Semicolons** - Print semicolons at the ends of statements.<br /><br />Valid options: <ul><li>`true` - add a semicolon at the end of every statement</li><li>`false` - only add semicolons at the beginning of lines that may introduce ASI failures</li></ul> | `true` | CLI: `--no-semi` <br />API: `semi: <bool>` |
| **Quotes** - Use single quotes instead of double quotes.<br /><br />Notes:<ul><li>Quotes in JSX will always be double and ignore this setting.</li><li>If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.</li></ul> | `false` | CLI: `--single-quote` <br />API: `singleQuote: <bool>` |
| **Trailing Commas** - Print trailing commas wherever possible.<br /><br />Valid options: <ul><li>`"none"` - no trailing commas </li><li>`"es5"` - trailing commas where valid in ES5 (objects, arrays, etc.)</li><li>`"all"` - trailing commas wherever possible (function arguments). This requires node 8 or a [transform](https://babeljs.io/docs/plugins/syntax-trailing-function-commas/).</li></ul> | `"none"` | CLI: <code>--trailing-comma <none&#124;es5&#124;all></code> <br />API: <code>trailingComma: "<none&#124;es5&#124;all>"</code> |
| **Bracket Spacing** - Print spaces between brackets in object literals.<br /><br />Valid options: <ul><li>`true` - Example: `{ foo: bar }`</li><li>`false` - Example: `{foo: bar}`</li> | `true` | CLI: `--no-bracket-spacing` <br />API: `bracketSpacing: <bool>` |
| **JSX Brackets on Same Line** - Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line | `false` | CLI: `--jsx-bracket-same-line` <br />API: `jsxBracketSameLine: <bool>` |
| **Cursor Offset** - Specify where the cursor is. This option only works with `prettier.formatWithCursor`, and cannot be used with `rangeStart` and `rangeEnd`. | `-1` | CLI: `--cursor-offset <int>` <br />API: `cursorOffset: <int>` |
| **Range Start** - Format code starting at a given character offset. The range will extend backwards to the start of the first line containing the selected statement. This option cannot be used with `cursorOffset`. | `0` | CLI: `--range-start <int>` <br />API: `rangeStart: <int>` |
| **Range End** - Format code ending at a given character offset (exclusive). The range will extend forwards to the end of the selected statement. This option cannot be used with `cursorOffset`. | `Infinity` | CLI: `--range-end <int>` <br />API: `rangeEnd: <int>` |
| **Parser** - Specify which parser to use. Both the `babylon` and `flow` parsers support the same set of JavaScript features (including Flow). Prettier automatically infers the parser from the input file path, so you shouldn't have to change this setting. <br />Built-in parsers: <ul><li>`babylon`</li><li>`flow`</li><li>`typescript`</li><li>`postcss`</li><li>`json`</li></ul>[Custom parsers](#custom-parser-api) are also supported. | `babylon` | CLI: <br />`--parser <string>` <br />`--parser ./path/to/my-parser` <br />API: <br />`parser: "<string>"` <br />`parser: require("./my-parser")` |
| **Filepath** - Specify the input filepath this will be used to do parser inference.<br /><br /> Example: <br />`cat foo \| prettier --stdin-filepath foo.css`<br /> will default to use `postcss` parser |  | CLI: `--stdin-filepath` <br />API: `filepath: "<string>"` |


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

#### Custom Parser API

If you need to make modifications to the AST (such as codemods), or you want to provide an alternate parser, you can do so by setting the `parser` option to a function. The function signature of the parser function is:
```js
(text: string, parsers: object, options: object) => AST;
```

Prettier's built-in parsers are exposed as properties on the `parsers` argument.


##### Example

```js
prettier.format("lodash ( )", {
  parser(text, { babylon }) {
    const ast = babylon(text);
    ast.program.body[0].expression.callee.name = "_";
    return ast;
  }
}); // ==> "_();\n"
```

The `--parser` CLI option may be a path to a node.js module exporting a parse function.

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

Vim users can simply install either [sbdchd](https://github.com/sbdchd)/[neoformat](https://github.com/sbdchd/neoformat) or [mitermayer](https://github.com/mitermayer)/[vim-prettier](https://github.com/mitermayer/vim-prettier), for more details see [this directory](https://github.com/prettier/prettier/tree/master/editors/vim)

### Visual Studio Code

Can be installed using the extension sidebar. Search for `Prettier - JavaScript formatter`.

Can also be installed using `ext install prettier-vscode`.

[Check its repository for configuration and shortcuts](https://github.com/esbenp/prettier-vscode)

### Visual Studio

Install the [JavaScript Prettier extension](https://github.com/madskristensen/JavaScriptPrettier).

### Sublime Text

Sublime Text support is available through Package Control and
the [JsPrettier](https://packagecontrol.io/packages/JsPrettier) plug-in.

### JetBrain's WebStorm, PHPStorm, PyCharm...

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

The minimum version of TypeScript supported is 2.1.3 as it introduces the ability to have leading `|` for type definitions which prettier outputs.

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
- [`prettier-github`](https://github.com/jgierer12/prettier-github) formats code in GitHub comments

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
represent a concatenation of opening parens, an argument, and closing
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
