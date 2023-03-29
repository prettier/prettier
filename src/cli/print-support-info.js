import stringify from "fast-json-stable-stringify";
import { getSupportInfo, format } from "../index.js";
import { printToScreen } from "./utils.js";

const sortByName = (array) =>
  array.sort((a, b) => a.name.localeCompare(b.name));

async function printSupportInfo() {
  const supportInfo = await getSupportInfo();
  sortByName(supportInfo.languages);
  sortByName(supportInfo.options);
  printToScreen(await format(stringify(supportInfo), { parser: "json" }));
}

export default printSupportInfo;
