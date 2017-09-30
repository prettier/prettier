---
id: options
title: Options
---

Prettier ships with a handful of customizable format options, usable in both the CLI and API.

<!-- AUTO-GENERATED-CONTENT:START (PRETTIER_OPTIONS:headingLevel=2) -->
## bracket-spacing
Print spaces between brackets.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--bracket-spacing` | `bracketSpacing: <bool>`

## jsx-bracket-same-line
Put > on the last line instead of at a new line.

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--jsx-bracket-same-line` | `jsxBracketSameLine: <bool>`

## parser
Which parser to use.

Both the `babylon` and `flow` parsers support the same set of JavaScript
features (including Flow). Prettier automatically infers the parser from the
input file path, so you shouldn't have to change this setting.

Valid options:

* `flow`        https://github.com/facebook/flow
* `babylon`     https://github.com/babel/babylon
* `typescript`  https://github.com/eslint/typescript-eslint-parser
* `css`         https://github.com/postcss/postcss
* `less`        https://github.com/shellscape/postcss-less
* `scss`        https://github.com/postcss/postcss-scss
* `json`        https://github.com/babel/babylon
* `graphql`     https://github.com/graphql/graphql-js

Default | CLI Override | API Override
--------|--------------|-------------
`"babylon"` | <code>--parser &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code> | <code>parser: &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code>

## print-width
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

## semi
Print semicolons.

Default | CLI Override | API Override
--------|--------------|-------------
`true` | `--semi` | `semi: <bool>`

## single-quote
Use single quotes instead of double quotes.

Notes:
* Quotes in JSX will always be double and ignore this setting.
* If the number of quotes outweighs the other quote, the quote which is less used will be used to format the string - Example: `"I'm double quoted"` results in `"I'm double quoted"` and `"This \"example\" is single quoted"` results in `'This "example" is single quoted'`.


Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--single-quote` | `singleQuote: <bool>`

## tab-width
Number of spaces per indentation level.

Default | CLI Override | API Override
--------|--------------|-------------
`2` | `--tab-width <int>` | `tabWidth: <int>`

## trailing-comma
Print trailing commas wherever possible when multi-line.
Valid options:

* `none`  No trailing commas.
* `es5`   Trailing commas where valid in ES5 (objects, arrays, etc.)
* `all`   Trailing commas wherever possible (including function arguments).

Default | CLI Override | API Override
--------|--------------|-------------
`"none"` | <code>--trailing-comma &lt;none&#124;es5&#124;all&gt;</code> | <code>trailingComma: &lt;none&#124;es5&#124;all&gt;</code>

## use-tabs
Indent with tabs instead of spaces.

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`
<!-- AUTO-GENERATED-CONTENT:END -->
