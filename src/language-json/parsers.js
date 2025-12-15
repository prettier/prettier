import createParser from "../language-js/parse/utilities/create-parser.js";
import { parseJson } from "./parse/json.js";

const json = /* @__PURE__ */ createParser({
  parse: (text) => parseJson(text),
  hasPragma: () => true,
  hasIgnorePragma: () => false,
});
const json5 = /* @__PURE__ */ createParser((text) => parseJson(text));
const jsonc = /* @__PURE__ */ createParser((text) =>
  parseJson(text, { allowEmpty: true }),
);
const jsonStringify = /* @__PURE__ */ createParser({
  parse: (text) => parseJson(text, { allowComments: false }),
  astFormat: "estree-json",
});

export { json, json5, jsonc, jsonStringify as "json-stringify" };
