import fs from "node:fs";
import { readJson, writeJson } from "../utils/index.mjs";

const vendorMetaFile = new URL("./vendor-meta.json", import.meta.url);
const getMeta = () =>
  fs.existsSync(vendorMetaFile) ? readJson(vendorMetaFile) : {};

export async function getVendorVersions() {
  const meta = await getMeta();
  return meta.versions;
}

export async function saveVendorVersions(versions) {
  const meta = await getMeta();
  meta.versions = versions;
  await writeJson(vendorMetaFile, meta);
}

export async function saveVendorLicenses(licenses) {
  const meta = await getMeta();
  meta.licenses = licenses;
  await writeJson(vendorMetaFile, meta);
}
