import fs from "node:fs";
import { readJson, writeJson } from "../utils/index.mjs";

export const vendorMetaFile = new URL("./vendor-meta.json", import.meta.url);
const getMeta = () =>
  fs.existsSync(vendorMetaFile) ? readJson(vendorMetaFile) : {};

export async function saveVendorLicenses(licenses) {
  const meta = await getMeta();
  meta.licenses = licenses;
  await writeJson(vendorMetaFile, meta);
}
