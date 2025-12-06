import fs from "node:fs/promises";
import * as prettier from "../index.js";

const PROJECT_ROOT = new URL("../", import.meta.url);
const FLOW_TYPES = new URL(
  "./node_modules/hermes-estree/dist/types.js.flow",
  PROJECT_ROOT,
);
const FLOW_TYPES_DTS = new URL(
  "./src/language-js/types/flow-estree.d.ts",
  PROJECT_ROOT,
);

let text = await fs.readFile(FLOW_TYPES, "utf8");

text = text.replaceAll("'use strict';", "  ");
text = text.replaceAll(/(?<=\n) {2,}\+/gu, "  ");
text = text.replaceAll("interface {", "{");
text = text.replaceAll(/: interface extends (\w+)/gu, ": $1 & ");

const getRelativePath = (url) =>
  new URL(url).href.slice(PROJECT_ROOT.href.length);
text = `
// ! Do NOT edit !
// Generated from '${getRelativePath(FLOW_TYPES)}'
// Run \`node ${getRelativePath(import.meta.url)}\` to update
// spell-checker: disable

${text}
`;

text = await prettier.format(text, {
  // Bug? should accept URL
  filepath: "flow-estree.d.ts",
  parser: "typescript",
});

await fs.writeFile(FLOW_TYPES_DTS, text);
