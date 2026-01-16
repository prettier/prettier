---
id: ci
title: Run Prettier on CI
---

## GitHub Actions

To apply autofix for Prettier from GitHub Actions, do the following:

1. Install the [`autofix.ci`](https://github.com/apps/autofix-ci) GitHub App.
1. Make sure you have a **pinned** version of Prettier installed in your repository.
1. Create `.github/workflows/prettier.yml` with following content:

   ```yaml title=".github/workflows/prettier.yml"
   name: autofix.ci
   on:
     pull_request:
     push:
   permissions: {}
   jobs:
     prettier:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: |
             yarn
             yarn prettier . --write
         - uses: autofix-ci/action@v1
           with:
             commit-message: "Apply Prettier format"
   ```

For more information see [autofix.ci](https://autofix.ci/) website.
