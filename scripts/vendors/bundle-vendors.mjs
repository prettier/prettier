#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";
import { PROJECT_ROOT } from "../utils/index.mjs";
import esbuildPluginLicense from "../build/esbuild-plugins/license.mjs";
import vendors from "./vendors.mjs";
import { saveVendorLicenses } from "./utils.mjs";
import esbuildPluginTsNocheck from "./esbuild-plugin-ts-nocheck.mjs";

const { __dirname, require } = createEsmUtils(import.meta);
const rootDir = path.join(__dirname, "..", "..");
// prettier/vendors
const vendorsDir = path.join(rootDir, "vendors");
// prettier/vendors/*.js
const getVendorFilePath = (vendorName) =>
  path.join(vendorsDir, `${vendorName}.js`);

async function fileExists(filePath) {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function cleanExistsBundledJS() {
  for (const file of await fs.readdir(vendorsDir)) {
    const filePath = path.join(vendorsDir, file);
    if (path.extname(file) === ".js" && (await fileExists(filePath))) {
      await fs.rm(filePath);
    }
  }
}

async function generateDts(vendor) {
  const hasDefault = await import(vendor).then((module) =>
    Boolean(module.default)
  );
  await fs.writeFile(
    path.join(vendorsDir, `${vendor}.d.ts`),
    [
      "// This file is generated automatically.",
      hasDefault ? `export {default} from "${vendor}";` : null,
      `export * from "${vendor}";`,
      "",
    ]
      .filter((line) => line !== null)
      .join("\n"),
    "utf-8"
  );
}

async function bundle(vendor, options) {
  const outfile = getVendorFilePath(vendor);
  if (await fileExists(outfile)) {
    await fs.rm(outfile);
  }

  /** @type {import("esbuild").CommonOptions} */
  const esbuildOption = {
    entryPoints: [require.resolve(vendor)],
    bundle: true,
    target: ["node12.17.0"],
    platform: "node",
    plugins: [
      esbuildPluginTsNocheck(),
      esbuildPluginLicense({
        cwd: PROJECT_ROOT,
        thirdParty: {
          includePrivate: true,
          output: options.onLicenseFound,
        },
      }),
    ],
    outfile,
  };
  await esbuild.build(esbuildOption);

  await generateDts(vendor);
}

async function main() {
  await cleanExistsBundledJS();

  const licenses = [];
  for (const vendor of vendors) {
    await bundle(vendor, {
      onLicenseFound(dependencies) {
        licenses.push(...dependencies);
      },
    });
    console.log(`Bundled: ${vendor}`);
  }

  await saveVendorLicenses(licenses);
  console.log("Vendor licenses saved");
}

main();
