---
authors: "fisker"
title: "Prettier 3.9: New Parser Foundations and Formatting Improvements"
---

We are excited to announce Prettier 3.9!

This release brings major parser upgrades for Markdown, YAML, GraphQL, and Flow, along with meaningful formatting improvements for JavaScript and TypeScript—particularly in `--no-semi` mode.

We upgraded the Markdown parser from `remark-parse` v8 to `micromark` v4. This delivers significantly better compliance with CommonMark and GFM, resulting in more accurate parsing and fewer edge-case formatting issues. Huge thanks to [@seiyab](https://github.com/seiyab), [@j-f1](https://github.com/j-f1), and everyone else who contributed to this long-awaited improvement!

The YAML parser has been upgraded to use `yaml` v2, thanks to excellent work on the [`yaml-unist-parser`](https://github.com/prettier/yaml-unist-parser/pull/301) side by [@ota-meshi](https://github.com/ota-meshi).

Prettier now fully supports newer syntax features from GraphQL.js v17, including directives on directive definitions, fragment arguments, and other enhancements.

<!-- TODO[@fisker]: this not merged yet, https://github.com/prettier/prettier/pull/19398 -->

We switched to the new Rust-based Flow parser (oxidized) released by the Flow team, which improves performance for Flow-typed code.

We also shipped several formatting improvements for JS/TS code, with particular attention to `--no-semi` mode.

If you find Prettier valuable, please consider [sponsoring us on OpenCollective](https://opencollective.com/prettier) or supporting the upstream projects we rely on. Your contributions help us keep improving the tool for everyone.

Thank you for your continued support! ❤️

<!-- truncate -->
