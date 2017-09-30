---
id: options
title: Options
---

Prettier ships with a handful of customizable format options, usable in both the CLI and API.

<!-- AUTO-GENERATED-CONTENT:START (PRETTIER_OPTIONS:headingLevel=2) -->
## Bracket spacing

Print spaces between brackets.


Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-bracket-spacing` | `bracketSpacing: <bool>`

## Cursor offset

Print (to stderr) where a cursor at the given position would move to after formatting.
This option cannot be used with --range-start and --range-end.


Default | CLI Override | API Override
--------|--------------|-------------
`-1` | `--cursor-offset <int>` | `cursorOffset: <int>`

## Jsx bracket same line

Put > on the last line instead of at a new line.


Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--jsx-bracket-same-line` | `jsxBracketSameLine: <bool>`

## Parser

Which parser to use.

Both the `babylon` and `flow` parsers support the same set of JavaScript
features (including Flow). Prettier automatically infers the parser from the
input file path, so you shouldn't have to change this setting.


Valid options:

* `flow`        https://github.com/facebook/flow
* `babylon`     https://github.com/babel/babylon
* `typescript`  https://github.com/eslint/typescript-eslint-parser
* `css`         scientifically try both postcss-less and postcss-scss
* `less`        https://github.com/shellscape/postcss-less
* `scss`        https://github.com/postcss/postcss-scss
* `json`        https://github.com/babel/babylon
* `graphql`     https://github.com/graphql/graphql-js


Default | CLI Override | API Override
--------|--------------|-------------
`"babylon"` | <code>--parser &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code> | <code>parser: &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code>

## Print width

The line length where Prettier will try wrap.

> **For readability we recommend against using more than 80 characters:**
>
> In code styleguides, maximum line length rules are often set to 100 or 120.
> However, when humans write code, they don't strive to reach the maximum
> number of columns on every line. Developers often use whitespace to break
> up long lines for readability. In practice, the average line length often
> ends up well below the maximum.
>
> Prettier, on the other hand, strives to fit the most code into every line.
> With the print width set to 120, prettier may produce overly compact, or
> otherwise undesirable code.



Default | CLI Override | API Override
--------|--------------|-------------
`80` | `--print-width <int>` | `printWidth: <int>`

## Range end

Format code ending at a given character offset (exclusive).
The range will extend forwards to the end of the selected statement.
This option cannot be used with --cursor-offset.


Default | CLI Override | API Override
--------|--------------|-------------
`Infinity` | `--range-end <int>` | `rangeEnd: <int>`

## Range start

Format code starting at a given character offset.
The range will extend backwards to the start of the first line containing the selected statement.
This option cannot be used with --cursor-offset.


Default | CLI Override | API Override
--------|--------------|-------------
`0` | `--range-start <int>` | `rangeStart: <int>`

## Require pragma

Require either '@prettier' or '@format' to be present in the file's first docblock comment
in order for it to be formatted.

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

## Semi

Print semicolons.


Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--no-semi` | `semi: <bool>`

## Single quote

Use single quotes instead of double quotes.

Notes:
* Quotes in JSX will always be double and ignore this setting.
* If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.



Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--single-quote` | `singleQuote: <bool>`

## Stdin filepath

Path to the file to pretend that stdin comes from.


Default | CLI Override | API Override
--------|--------------|-------------
N/A | `--stdin-filepath <path>` | `stdinFilepath: <path>`

## Tab width

Number of spaces per indentation level.


Default | CLI Override | API Override
--------|--------------|-------------
`2` | `--tab-width <int>` | `tabWidth: <int>`

## Trailing comma

Print trailing commas wherever possible when multi-line.

Valid options:

* `none`  No trailing commas.
* `es5`   Trailing commas where valid in ES5 (objects, arrays, etc.)
* `all`   Trailing commas wherever possible (including function arguments).


Default | CLI Override | API Override
--------|--------------|-------------
`"none"` | <code>--trailing-comma &lt;none&#124;es5&#124;all&gt;</code> | <code>trailingComma: &lt;none&#124;es5&#124;all&gt;</code>

## Use tabs

Indent with tabs instead of spaces.


Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`
<!-- AUTO-GENERATED-CONTENT:END -->
