import { group, indent, line } from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue } from "./utils.js";

const interpolationRegex = /\{\{(.+?)\}\}/su;

const isAngularInterpolation = ({ node: { value } } /* , options*/) =>
  interpolationRegex.test(value);

async function printAngularInterpolation(
  textToDoc,
  print,
  path,
  /* , options*/
) {
  const text = getUnescapedAttributeValue(path.node);
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

export { isAngularInterpolation, printAngularInterpolation };
