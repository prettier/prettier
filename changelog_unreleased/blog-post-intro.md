---
author: "Sosuke Suzuki (@sosukesuzuki)"
authorURL: "https://github.com/sosukesuzuki"
title: "Prettier 2.6: new singleAttributePerLine option and new JavaScript features!"
---

This release includes a new `singleAttributePerLine` option. This is an option to print only one attribute per line in Vue SFC templates, HTML, and JSX. Per our [Option Philosophy](https://prettier.io/docs/en/option-philosophy.html), we would prefer not to add such an option. However, there are many users who want this feature, and major style guides like [Airbnb’s JavaScript Style Guide](https://github.com/airbnb/javascript/blob/274c8d570155a05b016980294d4204c5711bce86/packages/eslint-config-airbnb/rules/react.js#L97-L99) and [Vue’s style guide](https://vuejs.org/style-guide/rules-strongly-recommended.html#multi-attribute-elements) recommend the single attribute per line style. A [PR](https://github.com/prettier/prettier/pull/6644) to add this feature was opened in October 2019, and both it and the [corresponding issue](https://github.com/prettier/prettier/issues/5501) have received a significant amount of support from users. For us it was a hard decision to add this option. We hope the addition of this option will benefit many users without significantly harming our principles.

We've also added support formatting for some new JavaScript syntax proposals via Babel.

## Thanks to our sponsors!

As discussed in [a blog post from earlier this year](https://prettier.io/blog/2022/01/06/prettier-begins-paying-maintainers.html), we have begun paying our maintainers from funds received from our sponsors. We would like to thank our many sponsors who have made this possible! We’re especially grateful to the following companies and individuals, who have donated over $1,000 to us:

- [Frontend Masters](https://frontendmasters.com/)
- [Salesforce](https://www.salesforce.com/)
- [Indeed](https://indeed.com/)
- [Sentry](https://sentry.io/welcome/)
- [Airbnb](https://www.airbnb.com/)
- [LINE](https://engineering.linecorp.com/en/)
- [AMP Project](https://www.ampproject.org/)
- [InVision AG](https://www.ivx.com/)
- [Ubie](https://ubiehealth.com/)
- [Shogun Labs, Inc](https://getshogun.com/)
- [Underbelly](https://www.underbelly.is/)
- [Principal Financial Group](https://www.principal.com/about-us)
- [Suhail Doshi](https://twitter.com/suhail)

If you enjoy Prettier and would like to support our work, consider sponsoring us directly via [our OpenCollective](https://opencollective.com/prettier) or by sponsoring the projects we depend on, including [typescript-eslint](https://opencollective.com/typescript-eslint), [remark](https://opencollective.com/unified), and [Babel](https://opencollective.com/babel).
