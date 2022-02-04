import fs from "node:fs/promises";

const vendorVersionsPath = new URL("./vendor-versions.json", import.meta.url);

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
