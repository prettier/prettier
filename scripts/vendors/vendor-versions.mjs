import fs from "node:fs/promises";
import path from "node:path";
import createEsmUtils from "esm-utils";

const { __dirname } = createEsmUtils(import.meta);

const vendorVersionsPath = path.join(__dirname, "vendor-versions.json");

export async function getVendorVersions() {
  return JSON.parse(await fs.readFile(vendorVersionsPath));
}

export async function writeVendorVersions(data) {
  await fs.writeFile(
    vendorVersionsPath,
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}
