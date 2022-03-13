---
author: "Sosuke Suzuki (@sosukesuzuki)"
authorURL: "https://github.com/sosukesuzuki"
title: "Prettier 2.6: new singleAttributePerLine option and new JavaScript features!"
---

This release includes a new `singleAttributePerLine` option. This is an option to print only one attribute per line in Vue SFC templates, HTML, and JSX. Per our [Option Philosophy](https://prettier.io/docs/en/option-philosophy.html), we would prefer not to add such an option. However, there are many users who want this feature, and major style guides like [Airbnb’s JavaScript Style Guide](https://github.com/airbnb/javascript/blob/274c8d570155a05b016980294d4204c5711bce86/packages/eslint-config-airbnb/rules/react.js#L97-L99) and [Vue’s style guide](https://vuejs.org/style-guide/rules-strongly-recommended.html#multi-attribute-elements) recommend the single attribute per line style. A PR (https://github.com/prettier/prettier/pull/6644) to add this feature was opened in October 2019, and both it and the corresponding issue (https://github.com/prettier/prettier/issues/5501) have received a significant amount of support from users. For us it was a hard decision to add this option. We hope the addition of this option will benefit many users without significantly harming our principles.

We've also added support formatting for some new JavaScript syntax proposals via Babel.

If you enjoy Prettier and would like to support our work, consider sponsoring us directly via [our OpenCollective](https://opencollective.com/prettier) or by sponsoring the projects we depend on, including [typescript-eslint](https://opencollective.com/typescript-eslint), [remark](https://opencollective.com/unified), and [Babel](https://opencollective.com/babel).

Please see our previously posted blog [Prettier begins paying maintainers](https://prettier.io/blog/2022/01/06/prettier-begins-paying-maintainers.html) on how we use our funds.
