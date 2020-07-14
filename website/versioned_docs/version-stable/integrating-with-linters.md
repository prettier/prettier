---
id: version-stable-integrating-with-linters
title: Integrating with Linters
original_id: integrating-with-linters
---

Linters usually contain not only code quality rules, but also stylistic rules. Most stylistic rules are unnecessary when using Prettier, but worse – they might conflict with Prettier! Use Prettier for code formatting concerns, and linters for code-quality concerns, as outlined in [Prettier vs. Linters](comparison.md).

Luckily it’s easy to turn off rules that conflict or are unnecessary with Prettier, by using these pre-made configs:

- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [tslint-config-prettier](https://github.com/alexjoverm/tslint-config-prettier)
- [stylelint-config-prettier](https://github.com/prettier/stylelint-config-prettier)

Check out the above links for instructions on how to install and set things up.

## Notes

When searching for both Prettier and your linter on the Internet you’ll probably find more related projects. These are **generally not recommended,** but can be useful in certain circumstances.

First, we have plugins that let you run Prettier as if it was a linter rule:

- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [tslint-plugin-prettier](https://github.com/ikatyang/tslint-plugin-prettier)
- [stylelint-prettier](https://github.com/prettier/stylelint-prettier)

These plugins were especially useful when Prettier was new. By running Prettier inside your linters, you didn’t have to set up any new infrastructure and you could re-use your editor integrations for the linters. But these days you can run `prettier --check .` and most editors have Prettier support.

The downsides of those plugins are:

- You end up with a lot of red squiggly lines in your editor, which gets annoying. Prettier is supposed to make you forget about formatting – and not be in your face about it!
- They are slower than running Prettier directly.
- They’re yet one layer of indirection where things may break.

Finally, we have tools that runs `prettier` and then immediately for example `eslint --fix` on files.

- [prettier-eslint](https://github.com/prettier/prettier-eslint)
- [prettier-tslint](https://github.com/azz/prettier-tslint)
- [prettier-stylelint](https://github.com/hugomrdias/prettier-stylelint)

Those are useful if some aspect of Prettier’s output makes Prettier completely unusable to you. Then you can have for example `eslint --fix` fix that up for you. The downside is that these tools are much slower than just running Prettier.
