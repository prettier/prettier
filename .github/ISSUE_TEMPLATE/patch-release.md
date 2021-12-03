---
name: 🚀 Check list for patch release
about: release check list for maintainers
---

- prepare
  - [ ] prepare `patch-release` branch
    - Checkout to `patch-release` branch from latest release tag.
    - cherry-pick relevant commits to `patch-release` from `main`
  - [ ] Run on other projects to check for regressions
    - use [prettier-regression-testing](https://github.com/prettire/prettier-regression-testing).
- publish
  - [ ] Run [release script](https://github.com/prettier/prettier/tree/main/scripts/release) on `patch-release` branch
- postpublish
  - [ ] Merge `patch-release` to `main`
