#!/usr/bin/env node

import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";
import { readPackage } from "read-pkg";
import { writePackage } from "write-pkg";

const vendors = ["string-width", "mem"];

const { __dirname, require } = createEsmUtils(import.meta);
const rootDir = path.join(__dirname, "..", "..");
// prettier/vendors
const vendorsDir = path.join(rootDir, "vendors");
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

async function updatePackage(imports) {
  const pkg = await readPackage({ normalize: false });
  pkg.imports = imports;
  await writePackage(pkg, { normalize: false });
}

async function main() {
  const imports = {};
  for (const vendor of vendors) {
    await bundle(vendor);
    imports[`#${vendor}`] =
      "./" + path.relative(rootDir, getVendorFilePath(vendor));
    console.log(`Bundled: ${vendor}`);
  }
  await updatePackage(imports);
  console.log("Updated: package.json");
}

main();
