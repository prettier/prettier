---
author: "Georgii Dolzhykov (@thorn0)"
authorURL: "https://github.com/thorn0"
title: "Prettier 2.3. In which assignments are consistent, short keys non-breaking, and Handlebars official"
---

This release focuses on fixing long-standing issues in the JavaScript printer. Be warned that, unfortunately, reformatting a project with the new version might result in quite a big diff. If you don’t use [`ignoreRevsFile`](https://git-scm.com/docs/git-blame#Documentation/git-blame.txt---ignore-revltrevgt) to hide such wholesale changes from `git blame`, it might be about time.

A remarkable milestone is the long-awaited release of the Ember / Handlebars formatter. It’s supposed to be the last formatter included directly in the core library. In the future, for sustainability, languages should be added only by plugins.

We are grateful to our financial contributors: [Salesforce](https://engineering.salesforce.com/foss-fund-brings-more-than-just-financial-contributions-7b0664067b1e), [Indeed](https://engineering.indeedblog.com/blog/2019/07/foss-fund-six-months-in/), [Frontend Masters](https://blog.opencollective.com/frontend-masters/), Airbnb, Shogun Labs, Skyscanner, Konstantin Pschera, and [many others](https://opencollective.com/prettier#section-contributors) who help us keep going. If you enjoy Prettier and would like to support our work, head to our [OpenCollective](https://opencollective.com/prettier). Please consider also supporting the projects Prettier depends on, such as [typescript-eslint](https://opencollective.com/typescript-eslint), [remark](https://opencollective.com/unified), and [Babel](https://opencollective.com/babel).

Most of the changes in this release are thanks to the hard work of [Fisker Cheung](https://github.com/fisker), [Georgii Dolzhykov](https://github.com/thorn0), and [Sosuke Suzuki](https://github.com/sosukesuzuki), along with many other contributors.

And just a reminder, when Prettier is installed or updated, it’s [strongly recommended](https://prettier.io/docs/en/install.html#summary) to specify the exact version in `package.json`: `"2.3.0"`, not `"^2.3.0"`.
