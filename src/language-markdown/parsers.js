import { locEnd, locStart } from "./loc.js";
import { parseMarkdown, parseMdx } from "./parse/index.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

const baseParser = {
  astFormat: "mdast",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};

export const markdown = { ...baseParser, parse: parseMarkdown };
export const mdx = { ...baseParser, parse: parseMdx };
export { markdown as remark };
