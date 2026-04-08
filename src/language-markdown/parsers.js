import { locEnd, locStart } from "./loc.js";
import { parseMarkdown, parseMdx } from "./parse/index.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

function createParser(parse) {
  return {
    astFormat: "mdast",
    hasPragma,
    hasIgnorePragma,
    locStart,
    locEnd,
    parse,
  };
}

const markdownParser = /* @__PURE__ */ createParser(parseMarkdown);
const mdxParser = /* @__PURE__ */ createParser(parseMdx);

export {
  markdownParser as markdown,
  mdxParser as mdx,
  markdownParser as remark,
};
