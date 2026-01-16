---
id: sharing-configurations
title: Sharing configurations
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

In case you have many different projects, it can be helpful to have a **shared configuration** which can be used in all of them, instead of copy-pasting the same config for every project.

This page explains how to create, publish and consume a shareable config.

## Creating a Shareable Config

Sharable configs are just [npm packages](https://docs.npmjs.com/about-packages-and-modules#about-packages) that export a single [prettier config file](./configuration.md).

Before we start, make sure you have:

- An account for [npmjs.com](https://www.npmjs.com/) to publish the package
- Basic understating about [how to create a Node.js module](https://docs.npmjs.com/creating-node-js-modules)

First, create a new package. We recommend creating a [scoped package](https://docs.npmjs.com/cli/v10/using-npm/scope) with the name `@username/prettier-config`.

A minimal package should have at least two files. A `package.json` for the package configuration and an `index.js` which holds the shared prettier configuration object:

```text
prettier-config/
├── index.js
└── package.json
```

Example `package.json`:

```json
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "type": "module",
  "exports": "./index.js",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "prettier": ">=3.0.0"
  }
}
```

`index.js` is where you put the shared configuration. This file just exports a [regular prettier configuration](./configuration.md) with the same syntax and same options:

```js
const config = {
  trailingComma: "es5",
  tabWidth: 4,
  singleQuote: true,
};

export default config;
```

An example shared configuration repository is available [here](https://github.com/azz/prettier-config).

## Publishing a Shareable Config

Once you are ready, you can [publish your package to npm](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages#publishing-scoped-public-packages):

```bash
npm publish
```

## Using a Shareable Config

You first need to install your published configuration, for example:

<Tabs groupId="package-manager">
<TabItem value="npm">

```bash
npm install --save-dev @username/prettier-config
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add --dev @username/prettier-config
```

</TabItem>
<TabItem value="pnpm">

```bash
pnpm add --save-dev @username/prettier-config
```

</TabItem>
<TabItem value="bun">

```bash
bun add --dev @username/prettier-config
```

</TabItem>
</Tabs>

Then, you can reference it in your `package.json`:

```json
{
  "name": "my-cool-library",
  "version": "1.0.0",
  "prettier": "@username/prettier-config"
}
```

If you don’t want to use `package.json`, you can use any of the supported extensions to export a string, e.g. `.prettierrc`:

```json
"@company/prettier-config"
```

### Extending a Sharable Config

To _extend_ the configuration to overwrite some properties from the shared configuration, import the file in a `.prettierrc.mjs` file and export the modifications, e.g:

```js
import usernamePrettierConfig from "@username/prettier-config";

/**
 * @type {import("prettier").Config}
 */
const config = {
  ...usernamePrettierConfig,
  semi: false,
};

export default config;
```

## Other examples

### Using Type Annotation in the Shared Config

You can get type safety and autocomplete support in your shared configuration by using a `jsdoc` type annotation:

```js
/**
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5",
  tabWidth: 4,
  semi: false,
  singleQuote: true,
};

export default config;
```

In order to make this work, you have to [install `prettier`](./install.md) for the project.

After that, your `package.json` file should look like this:

```diff
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "type": "module",
  "exports": "./index.js",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "prettier": ">=3.0.0"
  },
+ "devDependencies": {
+   "prettier": "^3.3.3"
+ }
}
```

### Include Plugins in Shareable Configurations

In case you want to use [plugins](./plugins.md) in your shared configuration, you need to declare those plugins in the config file's `plugin` array and as `dependencies` in `package.json`:

```js
// index.js
const config = {
  singleQuote: true,
  plugins: ["prettier-plugin-xml"],
};

export default config;
```

```diff
// package.json
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "type": "module",
  "exports": "./index.js",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
+  "dependencies": {
+    "prettier-plugin-xml": "3.4.1"
+  },
  "peerDependencies": {
    "prettier": ">=3.0.0"
  }
}
```

An example repository can be found [here](https://github.com/kachkaev/routine-npm-packages/tree/bc3e658f88c0b41beb118c7a1b9b91ec647f8478/packages/prettier-config)

**Note:** You can use [`peerDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies) instead of [`dependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#dependencies). To learn about their differences, you can read [this blog post from Domenic Denicola about peer dependencies](https://nodejs.org/en/blog/npm/peer-dependencies)
