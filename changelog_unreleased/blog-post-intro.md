---
authors: "sosukesuzuki"
title: "Prettier 3.6: Experimental fast CLI and new OXC and Hermes plugins!"
---

This release includes several important feature additions that we're excited to share with you.

First, we're shipping a new experimental high-performance CLI behind a feature flag (`--experimental-cli`). This CLI was previously only available in `prettier@next`, but now you can enable it simply by using a flag. We encourage you to try it out and share your feedback! If you are interested in the internal implementation, please read [Prettier's CLI: Performance Deep Dive by Fabio](https://prettier.io/blog/2023/11/30/cli-deep-dive).

Additionally, we're releasing two new official plugins: [`@prettier/plugin-oxc`](https://github.com/prettier/prettier/tree/main/packages/plugin-oxc) and [`@prettier/plugin-hermes`](https://github.com/prettier/prettier/tree/main/packages/plugin-hermes). These plugins are provided separately from Prettier's core.

We want to extend our heartfelt gratitude to everyone who made this amazing release possible: [@fabiospampinato](https://github.com/fabiospampinato), [@43081j](https://github.com/43081j), and [@pralkarz](https://github.com/pralkarz) along with the new CLI contributors, [@boshen](https://github.com/boshen) and [@overlookmotel](https://github.com/overlookmotel) along with other OXC contributors, the [Flow](https://flow.org/) and [Hermes](https://github.com/facebook/hermes/blob/main/README.md) teams at Meta. Thank you all for your incredible contributions!

We're excited to see how these new features enhance your development experience. Happy formatting!
