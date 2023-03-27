import { group, indent, line } from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { getUnescapedAttributeValue } from "../utils/index.js";

const interpolationRegex = /{{(.+?)}}/s;

async function printAngularInterpolation(path, ngTextToDoc) {
  const value = getUnescapedAttributeValue(path.node);

  const parts = [];
  for (const [index, part] of value.split(interpolationRegex).entries()) {
    if (index % 2 === 0) {
      parts.push(replaceEndOfLine(part));
    } else {
      try {
        parts.push(
          group([
            "{{",
            indent([
              line,
              await ngTextToDoc(part, {
                parser: "__ng_interpolation",
                __isInHtmlInterpolation: true, // to avoid unexpected `}}`
              }),
            ]),
            line,
            "}}",
          ])
        );
      } catch {
        parts.push("{{", replaceEndOfLine(part), "}}");
      }
    }
  }

  return group(parts);
}

export { interpolationRegex, printAngularInterpolation };
