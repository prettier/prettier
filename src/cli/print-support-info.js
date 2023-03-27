import stringify from "fast-json-stable-stringify";
import { getSupportInfo, format } from "../index.js";
import { printToScreen } from "./utils.js";

async function printSupportInfo() {
  const supportInfo = await getSupportInfo();

  supportInfo.languages.sort((languageA, languageB) =>
    (languageA.name ?? "").toLowerCase().localeCompare(languageB.name ?? "")
  );

  printToScreen(await format(stringify(supportInfo), { parser: "json" }));
}

export default printSupportInfo;
