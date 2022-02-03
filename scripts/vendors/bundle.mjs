#!/usr/bin/env node

import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";

const vendors = ["string-width"];

const { __dirname, require } = createEsmUtils(import.meta);
// prettier/vendors
const vendorsDir = path.join(__dirname, "..", "..", "vendors");
// prettier/vendors/*.js
const getVendorFilePath = (vendorName) =>
  path.join(vendorsDir, `${vendorName}.js`);

async function bundle(vendor) {
  /** @type {import("esbuild").CommonOptions} */
  const esbuildOption = {
    entryPoints: [require.resolve(vendor)],
    bundle: true,
    target: ["node12.17.0"],
    platform: "node",
    outfile: getVendorFilePath(vendor),
  };
  await esbuild.build(esbuildOption);
}

async function main() {
  for (const vendor of vendors) {
    await bundle(vendor);
    console.log(`Done: ${vendor}`);
  }
}

main();
