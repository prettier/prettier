# prettierx - less opinionated code formatter fork of prettier

[![NPM](https://nodei.co/npm/prettierx.png?compact=true)](https://nodei.co/npm/prettierx/)
[![Build Status](https://dev.azure.com/brodybits/brodybits/_apis/build/status/brodybits.prettierx?branchName=dev)](https://dev.azure.com/brodybits/brodybits/_build/latest?definitionId=1?branchName=dev)

Unofficial fork, intended to provide some additional options to help improve consistency with [`feross/standard`](https://github.com/standard/standard) and [`Flet/semistandard`](https://github.com/Flet/semistandard). This fork is an attempt to pick up where [`arijs/prettier-miscellaneous`](https://github.com/arijs/prettier-miscellaneous) left off.

Language parsers are supported with old language parsers deprecated as if this were `prettier` version `1.16.1`.

Minimum Node.js version supported: Node.js 6 - deprecated; Node.js 10 is recommended as described in: [`brodybits/prettierx#26`](https://github.com/brodybits/prettierx/issues/26)

FUTURE TODO: It is desired to provide the additional formatting options in a prettier plugin as discussed in: [`brodybits/prettierx#37`](https://github.com/brodybits/prettierx/issues/37)

## CLI Usage

**Quick CLI usage:**

```sh
prettierx <options> <file(s)>
```

## Additional prettierx options

| Option                                               | Default value | CLI Override                    | API Override                       | Description                                                                                      |
| ---------------------------------------------------- | ------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Align object properties                              | `false`       | `--align-object-properties`     | `alignObjectProperties: <bool>`    | Align colons in multiline object literals (not applied with any of the JSON parsers).            |
| Space before function parentheses                    | `false`       | `--space-before-function-paren` | `spaceBeforeFunctionParen: <bool>` | Put a space before function parenthesis.                                                         |
| Spaces around the star (\*\) in generator functions  | `false`       | `--generator-star-spacing`      | `generatorStarSpacing: <bool>`     | Add spaces around the star (\*) in generator functions (before and after - from eslint).         |
| Spaces around the star (\*\) in `yield*` expressions | `false`       | `--yield-star-spacing`          | `yieldStarSpacing: <bool>`         | Add spaces around the star (\*) in yield\* expressions (before and after - from eslint).         |
| Indent chains                                        | `true`        | `--no-indent-chains`            | `indentChains: <bool>`             | Print indents at the start of chained calls.                                                     |
| Align ternary lines                                  | `true`        | `--no-align-ternary-lines`      | `alignTernaryLines: <bool>`        | Align ternary lines in case of multiline ternery term (default behavior, conflict with standard) |

## standard-like formatting

The following options should be used to _format_ the code according to [standard js](https://standardjs.com/):

- `--generator-star-spacing` (`generatorStarSpacing: true`)
- `--space-before-function-paren` (`spaceBeforeFunctionParen: true`)
- `--single-quote` (`singleQuote: true`)
- `--jsx-single-quote` (`jsxSingleQuote: true`)
- `--no-semi` (`semi: false`)
- `--yield-star-spacing` (`yieldStarSpacing: true`)
- `--no-align-ternary-lines` (`alignTernaryLines: false`)

Note that this tool does _not_ follow any of the other [standard js](https://standardjs.com/) rules. It is recommended to use this tool together with eslint, in some form, to achive correct formatting according to [standard js](https://standardjs.com/).

<!-- - FUTURE TBD prettierx vs prettier (???):
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
  <a href="https://dev.azure.com/prettier/prettier/_build/latest?definitionId=5">
    <img alt="Azure Pipelines Build Status" src="https://img.shields.io/azure-devops/build/prettier/79013671-677c-4846-a6d8-3050d40e21c0/5.svg?style=flat-square&label=build&branchName=master"></a>
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

<!-- - FUTURE TBD prettierx vs prettier (???):
## Intro

Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.
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
