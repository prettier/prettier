---
id: version-stable-editors
title: Editor Integration
original_id: editors
---

## Atom

Atom users can simply install the [prettier-atom] package and use `Ctrl+Alt+F` to format a file (or format on save if enabled).

Alternatively, you can use one the packages below, which behave similarly to [prettier-atom] but have a focus on minimalism.

- [mprettier](https://github.com/t9md/atom-mprettier)
- [miniprettier](https://github.com/duailibe/atom-miniprettier)

## Emacs

Emacs users should see [this repository](https://github.com/prettier/prettier-emacs) for on-demand formatting.

## Vim

Vim users can install either [vim-prettier](https://github.com/prettier/vim-prettier), which is Prettier specific, or [Neoformat](https://github.com/sbdchd/neoformat) or [ALE](https://github.com/w0rp/ale) which are generalized lint/format engines with support for Prettier.

For more details see [the Vim setup guide](vim.md).

## Visual Studio Code

`prettier-vscode` can be installed using the extension sidebar. Search for `Prettier - Code formatter`. It can also be installed using `ext install prettier-vscode` in the command palette. [Check its repository for configuration and shortcuts](https://github.com/prettier/prettier-vscode).

If you'd like to toggle the formatter on and off, install [`vscode-status-bar-format-toggle`](https://marketplace.visualstudio.com/items?itemName=tombonnike.vscode-status-bar-format-toggle).

## Visual Studio

Install the [JavaScript Prettier extension](https://github.com/madskristensen/JavaScriptPrettier).

## Sublime Text

Sublime Text support is available through Package Control and the [JsPrettier](https://packagecontrol.io/packages/JsPrettier) plug-in.

## JetBrains WebStorm, PHPStorm, PyCharm...

See the [WebStorm setup guide](webstorm.md).

[prettier-atom]: https://github.com/prettier/prettier-atom
