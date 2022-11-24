# `./scripts/vendors`

Scripts for bundling Pure ESM Packages to CommonJS so that Prettier can use them.

## Context

<https://github.com/prettier/prettier/issues/12209#issuecomment-1028212785>

Currently, Prettier is developed using CommonJS Modules. This is for historical reasons, and we are considering [migrating to ECMAScript Modules](https://github.com/prettier/prettier/issues/10157) in the future.

However, migrating to ECMAScript Modules is not an easy task.

While we are working on it, several important packages are being migrated to Pure ESM. Please see <https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c> from [@sindresorhus](https://github.com/sindresorhus) about Pure ESM Packages.

It would be a problem if Prettier could not use the new Pure ESM Package until we have completed that work.

So we will put the files bundled with Pure ESM Packages as CommonJS Modules under `/vendors`, and Prettier will use them.

**This will be removed during the migration to ESM.**

## Usage

### `/scripts/vendors/bundle-vendors.mjs`

```bash
yarn vendors:bundle
```

This script do the following 4 things:

**1. Bundle ESM Packages to CommonJS**

Bundles listed packages in `vendors.mjs` into `/vendors/*.js` as CommonJS.

**2. Save vendors license info**

Saves vendors licenses info to `vendor-meta.json`.

**3. Generate `/vendors/*.d.ts`**

Generates a definition files that satisfies `lint:typecheck` for each vendors.
