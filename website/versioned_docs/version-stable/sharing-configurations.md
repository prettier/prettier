---
id: version-stable-sharing-configurations
title: Sharing configurations
original_id: sharing-configurations
---

In case you have many different projects, it can be helpful to have a **shared configuration** which can be used in all of them, instead of copy-pasting the same config for every project.

This page explains how to create, publish and consume a shareable config.

## Creating a Shareable Config

Sharable configs are just [npm packages](https://docs.npmjs.com/about-packages-and-modules#about-packages) that export a single [prettier config file](./configuration.md).

Before we start, make sure you have:

- An account for [npmjs.com](https://www.npmjs.com/) to publish the package
- Basic understating about [how to create a Node.js module](https://docs.npmjs.com/creating-node-js-modules)

First, create a new package. We recommend creating a [scoped package](https://docs.npmjs.com/cli/v10/using-npm/scope) with the name `@username/prettier-config`.

A minimal package should have at least two files. A `package.json` for the package configuration and an `index.json` which holds the shared prettier configuration values:

```text
prettier-config/
├── index.json
└── package.json
```

Example `package.json`:

```json
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "main": "index.json",
  "license": "MIT",
  "peerDependencies": {
    "prettier": ">=2.0.0"
  }
}
```

`index.json` is where you put the shared configuration. This file has the same fields as [normal prettier configuration file](./configuration.md). In this example, we added a `$schema` field to enable IDE autocompletion too:

```json
{
  "$schema": "http://json.schemastore.org/prettierrc",
  "singleQuote": true,
  "trailingComma": "all",
  "endOfLine": "lf"
}
```

An example shared configuration repository is available [here](https://github.com/azz/prettier-config).

## Publishing a Shareable Config

Once you are ready, you can [publish your package to npm](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages#publishing-scoped-public-packages):

```sh
npm publish --access public
```

## Using a Shareable Config

You first need to install your published configuration, for example:

```sh
npm install @username/prettier-config --save-dev
```

Then, you can reference it in your `package.json`:

```json
{
  "name": "my-cool-library",
  "version": "9000.0.1",
  "prettier": "@username/prettier-config"
}
```

If you don’t want to use `package.json`, you can use any of the supported extensions to export a string, e.g. `.prettierrc.json`:

```json
"@company/prettier-config"
```

### Extending a Sharable Config

To _extend_ the configuration to overwrite some properties from the shared configuration, import the file in a `.prettierrc.mjs` file and export the modifications, e.g:

```js
import myPrettierConfig from "@username/prettier-config";

export default {
  ...myPrettierConfig,
  semi: false,
};
```

## Other examples

### Sharing a JavaScript Configuration File

Instead of a `.json` file, you can write your shared configuration in JavaScript as well. For example:

```text
prettier-config/
├── index.mjs
└── package.json
```

```mjs
// index.mjs
export default {
  singleQuote: true,
  trailingComma: "all",
  endOfLine: "lf",
};
```

Don't forget to change the `main` field in your `package.json` too:

```json
// package.json
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "main": "index.mjs", // <-- change index.json to index.mjs
  "license": "MIT",
  "peerDependencies": {
    "prettier": ">=2.0.0"
  }
}
```

### Include Plugins in Shareable Configurations

In case you want to use [plugins](./plugins.md) in your shared configuration, you need to declare those plugins in the config file's `plugin` array and as `dependencies` in `package.json`:

```json
// index.json
{
  "$schema": "http://json.schemastore.org/prettierrc",
  "singleQuote": true,
  "plugins": ["prettier-plugin-xml"]
}
```

```json
// package.json
{
  "name": "@username/prettier-config",
  "version": "1.0.0",
  "description": "My personal Prettier config",
  "main": "index.json",
  "license": "MIT",
  "dependencies": {
    "prettier-plugin-xml": "^3.4.1"
  },
  "peerDependencies": {
    "prettier": ">=2.0.0"
  }
}
```

An example repository can be found [here](https://github.com/kachkaev/routine-npm-packages/tree/bc3e658f88c0b41beb118c7a1b9b91ec647f8478/packages/prettier-config)

**Note:** You can use [`peerDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies) instead of [`dependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#dependencies). To learn about their differences, you can read [this blog post from Domenic Denicola about peer dependencies](https://nodejs.org/en/blog/npm/peer-dependencies)
