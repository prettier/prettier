import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT, readJson, writeJson } from "../utils/index.mjs";

export const vendorsDirectory = path.join(PROJECT_ROOT, "vendors");
export const vendorMetaFile = new URL("./vendor-meta.json", import.meta.url);
const getMeta = () =>
  fs.existsSync(vendorMetaFile) ? readJson(vendorMetaFile) : {};

export async function saveVendorLicenses(licenses) {
  const meta = await getMeta();
  meta.licenses = licenses;
  await writeJson(vendorMetaFile, meta);
}

export async function saveVendorEntry(vendorName, file) {
  const meta = await getMeta();
  meta.entries = {
    ...meta.entries,
    [vendorName]: path.relative(vendorsDirectory, file),
  };
  await writeJson(vendorMetaFile, meta);
}
