---
id: language-support
title: Language Support
---

Prettier attempts to support all JavaScript language features, including non-standardized ones. By default it uses the [Babylon](https://github.com/babel/babylon) parser with all language features enabled, but you can also use the [Flow](https://github.com/facebook/flow) parser with the `parser` API or `--parser` CLI [option](options.md).

All of JSX and Flow syntax is supported. In fact, the test suite in `tests/flow` _is_ the entire Flow test suite and they all pass.

Prettier also supports [TypeScript](https://www.typescriptlang.org/), CSS, [Less](http://lesscss.org/), [SCSS](http://sass-lang.com), [Vue](https://vuejs.org/), [JSON](http://json.org/), [GraphQL](http://graphql.org/), [Markdown](http://commonmark.org), and [YAML](http://yaml.org/).

The minimum version of TypeScript supported is 2.1.3 as it introduces the ability to have leading `|` for type definitions which prettier outputs.
