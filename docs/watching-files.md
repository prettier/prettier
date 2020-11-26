---
id: watching-files
title: Watching For Changes
---

You can have Prettier watch for changes from the command line by using [onchange](https://www.npmjs.com/package/onchange). For example:

```bash
npx onchange "**/*" -- npx prettier --write --ignore-unknown {{changed}}
```

Or add the following to your `package.json`:

```json
{
  "scripts": {
    "prettier-watch": "onchange \"**/*\" -- prettier --write --ignore-unknown {{changed}}"
  }
}
```
