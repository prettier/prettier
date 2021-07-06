# prettierX - a less opinionated fork of Prettier

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm](https://img.shields.io/npm/v/prettierx.svg)](https://www.npmjs.com/package/prettierx)

An unofficial fork of the Prettier code formatter, intended to provide some additional options to help improve consistency with ["Standard JS"](https://standardjs.com/) ([`feross/standard`](https://github.com/standard/standard)) and [`Flet/semistandard`](https://github.com/Flet/semistandard). This fork is an attempt to pick up where [`arijs/prettier-miscellaneous`](https://github.com/arijs/prettier-miscellaneous) left off.

## prettierX as a Prettier plugin

[`prettier-plugin-x`](https://www.npmjs.com/package/prettier-plugin-x) - provides the additional formatting options in a prettier plugin

## CLI Usage

**Quick CLI usage:**

```sh
prettierx <options> <file(s)>
```

## Additional prettierX options

- `--align-object-properties` (`alignObjectProperties: true`): Align colons in multiline object literals (not applied with any of the JSON parsers).
- `--offset-ternary-expressions` (`offsetTernaryExpressions: true`): Indent and align ternary expression branches more consistently with "Standard JS" (similar to the corresponding eslint option).
- `--space-before-function-paren` (`spaceBeforeFunctionParen: true`): Put a space before function parenthesis in all declarations (similar to the corresponding eslint option). (Default is to put a space before function parenthesis for untyped anonymous functions only.)
- `--generator-star-spacing` (`generatorStarSpacing: true`): Put spaces around the star (`*`) in generator functions (before and after - similar to the corresponding eslint option). (Default is after only.)
- `--yield-star-spacing` (`yieldStarSpacing: true`): Put spaces around the star (`*`) in `yield*` expressions (before and after - similar to the corresponding eslint option). (Default is after only.)
- `--no-indent-chains` (`indentChains: false`): Disable indents at the start of chained calls.
- `--break-before-else` (`breakBeforeElse: true`): Always add a line break before else.
- <code>--import-formatting <auto&#124;oneline></code> (<code>importFormatting: "<auto&#124;oneline>"</code>): Formatting of import statements, may be `oneline` to avoid conflict with VSCode "Organize Imports" feature.
- `--html-void-tags` (`htmlVoidTags: true`): Format void HTML elements as void tags.
- `--break-long-method-chains` (`breakLongMethodChains: true`): Break method chains with more than 3 method calls, like Prettier 1.x.
- `--array-bracket-spacing` (`arrayBracketSpacing: true`): Put spaces between array brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.
- `--css-paren-spacing` (`cssParenSpacing: true`): Put spaces between parens in CSS, WordPress style. Status: experimental, with limited testing.
- `--computed-property-spacing` (`computedPropertySpacing: true`): Put spaces between computed property brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.",
- `--space-in-parens` (`spaceInParens: true`): Print spaces in between parens, WordPress style (similar to the corresponding eslint option). Not recommended in combination with the default `arrowParens: "always"` option. Status: experimental, with limited testing.
- `--space-unary-ops` (`spaceUnaryOps: true`): Put spaces after unary operator symbols, except in the middle of `!!` (similar to the corresponding eslint option). Status: experimental, with limited testing.
- `--template-curly-spacing` (`templateCurlySpacing: true`): Put spaces between template curly brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.
- `--type-angle-bracket-spacing` (`typeAngleBracketSpacing: true`): Put spaces between type angle brackets. Status: experimental, with limited testing.
- `--type-bracket-spacing` (`typeBracketSpacing: true`): Put spaces between type brackets. Status: experimental, with limited testing.
- `--no-export-curly-spacing` (`exportCurlySpacing: false`): Put or disable spaces between export curly braces.
- `--no-import-curly-spacing` (`importCurlySpacing: false`): Put or disable spaces between import curly braces.
- `--no-object-curly-spacing` (`objectCurlySpacing: false`): Disable spaces between object curly braces (similar to the corresponding eslint option).
- `--no-graphql-curly-spacing` (`graphqlCurlySpacing: false`): Disable spaces between curly braces for GraphQL.
- `--no-yaml-bracket-spacing` (`yamlBracketSpacing: false`): Disable spaces between brackets / curly braces for YAML.
- `--no-type-curly-spacing` (`typeCurlySpacing: false`): Disable spaces between type curly braces.

(See [`docs/options.md`](docs/options.md) for more information.)

## "Standard JS" formatting options

The following options should be used to _format_ the code _as consistently as possible_ with ["Standard JS"](https://standardjs.com/):

- `--arrow-parens avoid` (`arrowParens: "avoid"`)
- `--generator-star-spacing` (`generatorStarSpacing: true`)
- `--space-before-function-paren` (`spaceBeforeFunctionParen: true`)
- `--single-quote` (`singleQuote: true`)
- `--jsx-single-quote` (`jsxSingleQuote: true`)
- `--no-semi` (`semi: false`)
- `--offset-ternary-expressions` (`offsetTernaryExpressions: true`)
- `--yield-star-spacing` (`yieldStarSpacing: true`)
- `--trailing-comma none` (`trailingComma: "none"`)

Note that this tool does **not** follow any of the other ["Standard JS"](https://standardjs.com/) rules. It is recommended to use this tool together with eslint, in some form, to archive correct formatting according to ["Standard JS"](https://standardjs.com/).

Any known conflicts with ["Standard JS"](https://standardjs.com/) will be tracked in [open issues with the `conflict-with-standard` tag](https://github.com/brodybits/prettierx/issues?q=is%3Aissue+label%3Aconflict-with-standard+is%3Aopen).

## some recommended options

- `--arrow-parens avoid` (`arrowParens: "avoid"`), especially in combination with `--space-in-parens` (`spaceInParens: true`).
- `--break-long-method-chains` (`breakLongMethodChains: true`)
- `--offset-ternary-expressions` (`offsetTernaryExpressions: true`)

## options removed

- `--no-align-ternary-lines` - replaced with: `--offset-ternary-expressions`
- `--paren-spacing` - replaced with finer-grained options:
  - `--array-bracket-spacing`
  - `--css-paren-spacing`
  - `--computed-property-spacing`
  - `--space-in-parens`
  - `--space-unary-ops`
  - `--template-curly-spacing`
  - `--type-angle-bracket-spacing`
  - `--type-bracket-spacing`
- `no-bracket-spacing` - replaced with finer-grained options:
  - `--no-export-curly-spacing`
  - `--no-import-curly-spacing`
  - `--no-object-curly-spacing`
  - `--no-graphql-curly-spacing`
  - `--no-yaml-bracket-spacing`
  - `--no-type-curly-spacing`

<!-- - FUTURE TBD prettierx vs prettier (???):
## Prettier 2.0

This is the branch containing code for Prettier’s 2.0 release. See [the `master` branch](https://github.com/prettier/prettier) for the 1.x code/docs.

---

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

<h2 align="center">Opinionated Code Formatter</h2>

<p align="center">
  <em>
    JavaScript
    · TypeScript
    · Flow
    · JSX
    · JSON
  </em>
  <br />
  <em>
    CSS
    · SCSS
    · Less
  </em>
  <br />
  <em>
    HTML
    · Vue
    · Angular
  </em>
  <br />
  <em>
    GraphQL
    · Markdown
    · YAML
  </em>
  <br />
  <em>
    <a href="https://prettier.io/docs/en/plugins.html">
      Your favorite language?
    </a>
  </em>
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier/actions?query=workflow%3AProd+branch%3Amain">
    <img alt="Github Actions Build Status" src="https://img.shields.io/github/workflow/status/prettier/prettier/Prod?label=Prod&style=flat-square"></a>
  <a href="https://github.com/prettier/prettier/actions?query=workflow%3ADev+branch%3Amain">
    <img alt="Github Actions Build Status" src="https://img.shields.io/github/workflow/status/prettier/prettier/Dev?label=Dev&style=flat-square"></a>
  <a href="https://github.com/prettier/prettier/actions?query=workflow%3ALint+branch%3Amain">
    <img alt="Github Actions Build Status" src="https://img.shields.io/github/workflow/status/prettier/prettier/Lint?label=Lint&style=flat-square"></a>
  <a href="https://codecov.io/gh/prettier/prettier">
    <img alt="Codecov Coverage Status" src="https://img.shields.io/codecov/c/github/prettier/prettier.svg?style=flat-square"></a>
  <a href="https://twitter.com/acdlite/status/974390255393505280">
    <img alt="Blazing Fast" src="https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg?style=flat-square"></a>
  <br/>
  <a href="https://www.npmjs.com/package/prettier">
    <img alt="npm version" src="https://img.shields.io/npm/v/prettier.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/prettier">
    <img alt="weekly downloads from npm" src="https://img.shields.io/npm/dw/prettier.svg?style=flat-square"></a>
  <a href="#badge">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"></a>
  <a href="https://gitter.im/jlongster/prettier">
    <img alt="Chat on Gitter" src="https://img.shields.io/gitter/room/jlongster/prettier.svg?style=flat-square"></a>
  <a href="https://twitter.com/PrettierCode">
    <img alt="Follow Prettier on Twitter" src="https://img.shields.io/twitter/follow/prettiercode.svg?label=follow+prettier&style=flat-square"></a>
</p>
- -->

<!-- FUTURE TBD improved description of feature from WordPress Prettier fork somewhere:
## WordPress Prettier

This is a fork of Prettier that adds a new command line option `--paren-spacing` which inserts many extra spaces inside parentheses, the way how projects in the WordPress ecosystem (Calypso, Gutenberg, etc.) like to format their code.
- -->

<!-- - FUTURE TBD prettierx vs prettier (???):
In order to install a version based on a particular upstream version (like 1.x.x), run
```sh
npm i --save-dev "git+https://github.com/Automattic/wp-prettier.git#wp-prettier-1.x.x"
```
To figure out what the latest supported version of the fork is, look at the default branch of this repository.

The original readme continues unchanged below:

## Intro

Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.
- --
- -->

### Input

<!-- prettier-ignore -->
```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

### Output

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

<!-- - FUTURE TBD prettierx vs prettier (???):
Prettier can be run [in your editor](http://prettier.io/docs/en/editors.html) on-save, in a [pre-commit hook](https://prettier.io/docs/en/precommit.html), or in [CI environments](https://prettier.io/docs/en/cli.html#list-different) to ensure your codebase has a consistent style without devs ever having to post a nit-picky comment on a code review ever again!
- -->

## Integration with eslint

A couple packages by [@aMarCruz (Alberto Martínez)](https://github.com/aMarCruz):

- [`eslint-plugin-prettierx`](https://www.npmjs.com/package/eslint-plugin-prettierx)
- [`eslint-config-standardized`](https://www.npmjs.com/package/eslint-config-standardize)

<!-- -- --- -- -->

<!-- - FUTURE TBD prettierx vs prettier (???):
**[Documentation](https://prettier.io/docs/en/)**
- -->

<!-- prettier-ignore -->
<!-- - FUTURE TBD prettierx vs prettier (???):
[Install](https://prettier.io/docs/en/install.html) ·
[Options](https://prettier.io/docs/en/options.html) ·
[CLI](https://prettier.io/docs/en/cli.html) ·
[API](https://prettier.io/docs/en/api.html)

**[Playground](https://prettier.io/playground/)**
- -->

---

<!-- - FUTURE TBD prettierx vs prettier (???):
## Badge

Show the world you're using _Prettier_ → [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

```md
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
```
- -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
