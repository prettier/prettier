<!-- Labels: [lang:typescript] [type:option request] -->

Hi! Thanks for bringing this up. Unfortunately, we [generally don’t add configuration options](https://github.com/prettier/prettier/issues/40), and instead encourage you follow Prettier’s style.
However, if you’d really like to keep your style, you can use [`prettier-tslint`](https://github.com/azz/prettier-tslint), a tool that runs your code through a TSLint config of your choice after running Prettier, enabling you to choose and enforce your own style guide while still taking advantage of Prettier’s features.
