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

Default | CLI Override | API Override
--------|--------------|-------------
`"babylon"` | <code>--parser &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code> | <code>parser: &lt;flow&#124;babylon&#124;typescript&#124;css&#124;less&#124;scss&#124;json&#124;graphql&gt;</code>

## print-width
The line length where Prettier will try wrap.

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

Default | CLI Override | API Override
--------|--------------|-------------
`"none"` | <code>--trailing-comma &lt;none&#124;es5&#124;all&gt;</code> | <code>trailingComma: &lt;none&#124;es5&#124;all&gt;</code>

## use-tabs
Indent with tabs instead of spaces.

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`

<!-- AUTO-GENERATED-CONTENT:END -->
