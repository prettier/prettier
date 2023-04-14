---
author: "Sosuke Suzuki (@sosukesuzuki)"
authorURL: "https://github.com/sosukesuzuki"
title: "Prettier 3.0: Hello, ECMAScript Modules!"
---

We are excited to announce the release of the new version of Prettier!

We have made the migration to using ECMAScript Modules for all our source code. This change has significantly improved the development experience for the Prettier team. Please rest assured that when using Prettier as a library, you can still use it as CommonJS as well.

This update comes with several breaking changes. One notable example is the alteration in markdown formatting - spaces are no longer inserted between Latin characters and Chinese or Japanese characters. We'd like to extend our gratitude to [Tatsunori Uchino](https://github.com/tats-u), who has made significant contributions to Prettier over the past year, particularly with this feature. Additionally, the default value of `trailingComma` has been changed to `"all"`.

Another important change in this release is the significant overhaul of the plugin interface. Prettier now supports plugins written using ECMAScript Modules and async parsers. If you're a plugin developer, please exercise caution while updating. You can find [the migration guide](https://github.com/prettier/prettier/wiki/How-to-migrate-my-plugin-to-support-Prettier-v3%3F) here. As always, we welcome bug reports and feedback!

This release also includes numerous formatting improvements and bug fixes.

If you appreciate Prettier and would like to support our work, please consider sponsoring us directly via our OpenCollective or by sponsoring the projects we depend on, such as [typescript-eslint](https://opencollective.com/typescript-eslint), [remark](https://opencollective.com/unified), and [Babel](https://opencollective.com/babel). Thank you for your continued support!
