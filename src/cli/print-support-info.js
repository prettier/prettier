import stringify from "fast-json-stable-stringify";
import { format, getSupportInfo } from "../index.js";
import { omit, printToScreen } from "./utils.js";

const sortByName = (array) =>
  array.sort((a, b) => a.name.localeCompare(b.name));

async function printSupportInfo() {
  const { languages, options } = await getSupportInfo();
  const supportInfo = {
    languages: sortByName(languages),
    options: sortByName(options).map((option) =>
      omit(option, ["cliName", "cliCategory", "cliDescription"]),
    ),
  };

  printToScreen(await format(stringify(supportInfo), { parser: "json" }));
}

export default printSupportInfo;
