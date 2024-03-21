import { group, indent, line } from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { formatAttributeValue } from "./utils.js";

const interpolationRegex = /{{(.+?)}}/s;

async function printAngularInterpolation(text, textToDoc) {
  const parts = [];
  for (const [index, part] of text.split(interpolationRegex).entries()) {
    if (index % 2 === 0) {
      parts.push(replaceEndOfLine(part));
    } else {
      try {
        parts.push(
          group([
            "{{",
            indent([
              line,
              await formatAttributeValue(part, textToDoc, {
                parser: "__ng_interpolation",
                __isInHtmlInterpolation: true, // to avoid unexpected `}}`
              }),
            ]),
            line,
            "}}",
          ]),
        );
      } catch {
        parts.push("{{", replaceEndOfLine(part), "}}");
      }
    }
  }

  return parts;
}

export { interpolationRegex, printAngularInterpolation };
