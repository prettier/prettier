---
id: comparison
title: Prettier vs. Linters
---

## How does it compare to ESLint/TSLint/stylelint, etc.?

Linters have two categories of rules:

**Formatting rules**: eg: [max-len](http://eslint.org/docs/rules/max-len), [no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs), [keyword-spacing](http://eslint.org/docs/rules/keyword-spacing), [comma-style](http://eslint.org/docs/rules/comma-style)...

Prettier alleviates the need for this whole category of rules! Prettier is going to reprint the entire program from scratch in a consistent way, so it's not possible for the programmer to make a mistake there anymore :)

**Code-quality rules**: eg [no-unused-vars](http://eslint.org/docs/rules/no-unused-vars), [no-extra-bind](http://eslint.org/docs/rules/no-extra-bind), [no-implicit-globals](http://eslint.org/docs/rules/no-implicit-globals), [prefer-promise-reject-errors](http://eslint.org/docs/rules/prefer-promise-reject-errors)...

Prettier does nothing to help with those kind of rules. They are also the most important ones provided by linters as they are likely to catch real bugs with your code!
