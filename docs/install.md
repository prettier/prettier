---
id: install
title: Install
---

```bash
npm install --save-dev --save-exact prettier
```

> We recommend installing locally, and pinning an exact version of Prettier in your `package.json` as we introduce stylistic changes in patch releases.

If you use `npx` to run Prettier, the version should be pinned like this:

```bash
npx prettier@2.0.5 . --write
```
