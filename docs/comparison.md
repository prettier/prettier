---
id: comparison
title: Prettier vs. Linters
---

## How does it compare to ESLint/TSLint/stylelint, etc.?

Linters have two categories of rules:

**Formatting rules**: eg: [max-len](https://eslint.org/docs/rules/max-len), [no-mixed-spaces-and-tabs](https://eslint.org/docs/rules/no-mixed-spaces-and-tabs), [keyword-spacing](https://eslint.org/docs/rules/keyword-spacing), [comma-style](https://eslint.org/docs/rules/comma-style)…

Prettier alleviates the need for this whole category of rules! Prettier is going to reprint the entire program from scratch in a consistent way, so it’s not possible for the programmer to make a mistake there anymore :)

Unlike a linter, Prettier is not built from a list of independent formatting rules that can be enabled, disabled, or configured independently. It parses your code, discards the original formatting, and prints it again using a single printing process configured by a small set of options. Those options are parameters to the printer, not pluggable rules.

**Code-quality rules**: eg [no-unused-vars](https://eslint.org/docs/rules/no-unused-vars), [no-extra-bind](https://eslint.org/docs/rules/no-extra-bind), [no-implicit-globals](https://eslint.org/docs/rules/no-implicit-globals), [prefer-promise-reject-errors](https://eslint.org/docs/rules/prefer-promise-reject-errors)…

Prettier does nothing to help with those kind of rules. They are also the most important ones provided by linters as they are likely to catch real bugs with your code!

In other words, use **Prettier for formatting** and **linters for catching bugs!**
