---
authors: "sosukesuzuki"
title: "Prettier 3.5: New `objectWrap` option, `experimentalOperatorPosition` option and TS config file support!"
---

This release includes a lot of bug fixes and the following new features:

- Support for the new `objectWrap` option
- Support for the new experimental `experimentalOperatorPosition` option
- Support for TypeScript configuration file

See each section for details.

<!-- truncate -->

If you appreciate Prettier and would like to support our work, please consider sponsoring us directly via [our OpenCollective](https://opencollective.com/prettier) or by sponsoring the projects we depend on, such as [typescript-eslint](https://opencollective.com/typescript-eslint), [remark](https://opencollective.com/unified), and [Babel](https://opencollective.com/babel). Thank you for your continued support!

## Why We Added Two New Options

This release introduces two new options. If you’re familiar with Prettier’s [Option Philosophy](https://prettier.io/docs/option-philosophy/), you might be wondering: “Why add new options?” Rest assured, these aren’t your typical options, nor do they violate our option philosophy.

As the name suggests, `experimentalOperatorPosition` is experimental. We have a [policy for experimental options](https://github.com/prettier/prettier/issues/14527), which means it will eventually be removed. In the future, the new behavior could become the default, or this option might be dropped entirely. If you’ve been following Prettier for a while, you may recall we once added an `experimentalTernaries` option, and this follows the same approach.

`objectWrap` is a bit special. For a long time, we’ve struggled with how to print multi-line objects. We haven’t yet found the perfect solution, so we’ve resorted to a semi-manual approach. For more details, see our [Rationale](https://prettier.io/docs/rationale/#multi-line-objects). The current behavior isn’t ideal because the final output can vary based on how the user writes their code. To provide a more consistent format, we’ve decided to introduce the `objectWrap` option.

Although this release includes two new options, **we want to emphasize that we haven’t forgotten Prettier’s option philosophy**. These options address specific, long-standing formatting challenges without compromising our option philosophy.
