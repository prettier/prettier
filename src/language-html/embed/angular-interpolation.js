import { group, indent, line, replaceEndOfLine } from "../../document/index.js";
import {
  getInterpolationRanges,
  getUnescapedAttributeValue,
} from "../utilities/index.js";
import { formatAttributeValue } from "./utilities.js";

const isAngularInterpolation = ({ node: { value } } /* , options*/) =>
  getInterpolationRanges(value).length > 0;

async function printAngularInterpolation(
  textToDoc,
  print,
  path,
  /* , options*/
) {
  const text = getUnescapedAttributeValue(path.node);
  const ranges = getInterpolationRanges(text);
  const parts = [];

  let lastEnd = 0;
  for (const range of ranges) {
    // Add text before this interpolation
    if (range.start > lastEnd) {
      parts.push(replaceEndOfLine(text.slice(lastEnd, range.start)));
    }

    try {
      parts.push(
        group([
          "{{",
          indent([
            line,
            await formatAttributeValue(range.content, textToDoc, {
              parser: "__ng_interpolation",
              __isInHtmlInterpolation: true, // to avoid unexpected `}}`
            }),
          ]),
          line,
          "}}",
        ]),
      );
    } catch {
      parts.push("{{", replaceEndOfLine(range.content), "}}");
    }

    lastEnd = range.end;
  }

  // Add remaining text after last interpolation
  if (lastEnd < text.length) {
    parts.push(replaceEndOfLine(text.slice(lastEnd)));
  }

  return parts;
}

export { isAngularInterpolation, printAngularInterpolation };
