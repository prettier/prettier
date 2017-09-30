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
`"babylon"` | `--parser <flow|babylon|typescript|css|less|scss|json|graphql>` | `parser: <flow|babylon|typescript|css|less|scss|json|graphql>`

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
`"none"` | `--trailing-comma <none|es5|all>` | `trailingComma: <none|es5|all>`

## use-tabs
Indent with tabs instead of spaces.

Default | CLI Override | API Override
--------|--------------|-------------
`false` | `--use-tabs` | `useTabs: <bool>`

<!-- AUTO-GENERATED-CONTENT:END -->
