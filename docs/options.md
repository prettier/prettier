---
id: options
title: Options
---

Prettier ships with a handful of customizable format options, usable in both the CLI and API.

## Print Width
Specify the length of line that the printer will wrap on.

**We strongly recommend against using more than 80 columns.**

Prettier works by cramming as much content as possible until it reaches the limit, which happens to work well for 80 columns but makes lines that are very crowded. When a bigger column count is used in styleguides, it usually means that code is allowed to go beyond 80 columns, but not to make every single line go there, like Prettier would do.

Default | CLI Override | API Override
--------|--------------|-------------
`80` | `--print-width <int>` | `printWidth: <int>`

## Tab Width
Specify the number of spaces per indentation-level.

Default | CLI Override | API Override
--------|--------------|-------------
 `2` | `--tab-width <int>` | `tabWidth: <int>`

## Tabs
Indent lines with tabs instead of spaces

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`

## Semicolons
Print semicolons at the ends of statements.

Valid options:

 * `true` - Add a semicolon at the end of every statement.
 * `false` - Only add semicolons at the beginning of lines that may introduce ASI failures.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-semi` | `semi: <bool>`

## Quotes
Use single quotes instead of double quotes.

Notes:

* Quotes in JSX will always be double and ignore this setting.
* If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.

Default | CLI Override | API Override
--------|--------------|-------------
`false` |  `--single-quote` | `singleQuote: <bool>`

## Trailing Commas
Print trailing commas wherever possible.

Valid options:

 * `"none"` - No trailing commas.
 * `"es5"` - Trailing commas where valid in ES5 (objects, arrays, etc.)
 * `"all"` - Trailing commas wherever possible (function arguments). This requires node 8 or a [transform](https://babeljs.io/docs/plugins/syntax-trailing-function-commas/).

Default | CLI Override | API Override
--------|--------------|-------------
`"none"` | `--trailing-comma <none,es5,all>` | `trailingComma: "<none,es5,all>"`

## Bracket Spacing
Print spaces between brackets in object literals.

Valid options:
 * `true` - Example: `{ foo: bar }`.
 * `false` - Example: `{foo: bar}`.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-bracket-spacing` | `bracketSpacing: <bool>`

## JSX Brackets
Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line.

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--jsx-bracket-same-line` | `jsxBracketSameLine: <bool>`

## Range
Format only a segment of a file.

These two options can be used to format code starting and ending at a given character offset (inclusive and exclusive, respectively). The range will extend:

* Backwards to the start of the first line containing the selected statement.
* Forwards to the end of the selected statement.

These options cannot be used with `cursorOffset`.

Default | CLI Override | API Override
--------|--------------|-------------
`0`        | `--range-start <int>`| `rangeStart: <int>`
`Infinity` | `--range-end <int>`  | `rangeEnd: <int>`

## Parser
Specify which parser to use.

Both the `babylon` and `flow` parsers support the same set of JavaScript features (including Flow). Prettier automatically infers the parser from the input file path, so you shouldn't have to change this setting.

Built-in parsers:

 * [`babylon`](https://github.com/babel/babylon/)
 * [`flow`](https://github.com/facebook/flow/tree/master/src/parser)
 * [`typescript`](https://github.com/eslint/typescript-eslint-parser) _Since v1.4.0_
 * [`postcss`](https://github.com/postcss/postcss) _Since v1.4.0_
 * [`json`](https://github.com/vtrushin/json-to-ast) _Since v1.5.0_
 * [`graphql`](https://github.com/graphql/graphql-js/tree/master/src/language) _Since v1.5.0_

[Custom parsers](#custom-parser-api) are also supported.  _Since v1.5.0_

Default | CLI Override | API Override
--------|--------------|-------------
`babylon` | `--parser <string>` or `--parser ./my-parser` | `parser: "<string>"` or `parser: require("./my-parser")`

## Filepath
Specify the input filepath. This will be used to do parser inference.

For example, the following will use `postcss` parser:

```bash
cat foo | prettier --stdin-filepath foo.css
```

Default | CLI Override | API Override
--------|--------------|-------------
None | `--stdin-filepath <string>` | `filepath: "<string>"`

## Require pragma
Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file. This is very useful
when gradually transitioning large, unformatted codebases to prettier.

For example, a file with the following as its first comment will be formatted when `--require-pragma` is supplied:

```js
/**
 * @prettier
 */
```

or

```js
/**
 * @format
 */
```

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--require-pragma` | `requirePragma: <bool>`
<!--
## Insert Pragma
Prettier can insert a special @format marker at the top of files specifying that the file has been formatted
with prettier.  This works well when used in tandem with the `--require-pragma` option.  If there is already a 
docblock at the top of the file then this option will add a newline to it with the @format marker. 

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--insert-pragma` | `insertPragma: <bool>`
-->
