<!-- Labels: [lang:javascript] (or [lang:typescript]) [type:option request] -->

Hi! Thanks for bringing this up. Unfortunately, we [generally don’t add configuration options](https://github.com/prettier/prettier/issues/40), and instead encourage you to use [`prettier-eslint`](https://github.com/prettier/prettier-eslint-cli), a tool that runs your code through an ESLint config of your choice after running Prettier, enabling you to choose and enforce your own style guide while still taking advantage of Prettier’s features.
