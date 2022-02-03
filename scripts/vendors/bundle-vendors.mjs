#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";
import { readPackage } from "read-pkg";
import { writePackage } from "write-pkg";
import { readPackageUp } from "read-pkg-up";
import vendors from "./vendors.mjs";
import { writeVendorVersions } from "./vendor-versions.mjs";

const { __dirname, require } = createEsmUtils(import.meta);
const rootDir = path.join(__dirname, "..", "..");
// prettier/vendors
const vendorsDir = path.join(rootDir, "vendors");
// prettier/vendors/*.js
const getVendorFilePath = (vendorName) =>
  path.join(vendorsDir, `${vendorName}.js`);

async function lockVersions(vendors) {
  const vendorVersions = {};
  for (const vendor of vendors) {
    const { packageJson: vendorPackage } = await readPackageUp({
      cwd: path.dirname(require.resolve(vendor)),
    });
    const vendorVersion = vendorPackage.version;
    vendorVersions[vendor] = vendorVersion;
  }
  await writeVendorVersions(vendorVersions);
}

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

async function generateDts(vendors) {
  let dtsContent = "// This file is generate automatically.\n";
  for (const vendor of vendors) {
    dtsContent += `declare module "#${vendor}";\n`;
  }
  await fs.writeFile(path.join(vendorsDir, "types.d.ts"), dtsContent, "utf-8");
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
  await lockVersions(vendors);
  console.log("Locked: vendor-versions.json");
  await generateDts(vendors);
  console.log("Generated: vendors/types.d.ts");
}

main();
