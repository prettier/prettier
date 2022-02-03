# `./scripts/vendors`

Scripts for bundling Pure ESM Packages to CommonJS so that Prettier can use them.

## Context

https://github.com/prettier/prettier/issues/12209#issuecomment-1028212785

Currently, Prettier is developed using CommonJS Modules. This is for historical reasons, and we are considering [migrating to ECMAScript Modules](https://github.com/prettier/prettier/issues/10157) in the future.

However, migrating to ECMAScript Modules is not an easy task.

While we are working on it, several important packages are being migrated to Pure ESM. Please see https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c from [@sindresorhus](https://github.com/sindresorhus) about Pure ESM Packages.

It would be a problem if Prettier could not use the new Pure ESM Package until we have completed that work.

So we will put the files bundled with Pure ESM Packages as CommonJS Modules under `/vendors`, and Prettier will use them.

**This will be removed during the migration to ESM.**

## Usage

### `/scripts/vendors/bundle-vendors.mjs`

```
node ./scripts/vendors/bundle-vendors.mjs
```

This script do the following 4 things:

**1. Bundle ESM Packages to CommonJS**

This bundles listed packages in `vendors.mjs` into `/vendors/*.js` as CommonJS.

**2. Update `package.json`**

This updates [`"imports"` in `package.json`](https://nodejs.org/api/packages.html#imports) to enables aliases to resolve packages put in `/vendors/*.js`.

**3. Lock ESM Packages version to `vendor-versions.json`**

This locks versions of packages that is bundled to `vendor-versions.json`. It is used to validate by `validate-vendor-versions.mjs`.

**4. Generate `/vendors/types.d.ts`**

This Generates a minimal type definition file that satisfies `lint:typecheck`.

### `/scripts/vendors/validate-vendor-versions.mjs`

```
node ./scripts/vendors/validate-vendor-versions.mjs
```

This script compares the version of packages locked in `vendor-versions.json` with the version of packages actually installed, and fails if they are different.

This is mainly run on CI to keep consistency between bundled and installed packages.
