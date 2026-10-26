import {
  align,
  hardline,
  printDocToString,
  replaceEndOfLine,
} from "../../document/index.js";
import getMaxContinuousCount from "../../utilities/get-max-continuous-count.js";
import { getFencedCodeBlockValue } from "../utilities.js";

function printCodeFences(valueDoc, options) {
  const styleUnit = options.__inJsTemplate ? "~" : "`";
  const value =
    typeof valueDoc === "string"
      ? valueDoc
      : printDocToString(valueDoc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
          endOfLine: "lf",
        }).formatted;

  return styleUnit.repeat(
    Math.max(3, getMaxContinuousCount(value, styleUnit) + 1),
  );
}

function printFencedCodeBlock(path, options) {
  const { node } = path;

  const value =
    options.parser === "mdx"
      ? getFencedCodeBlockValue(node, options.originalText)
      : node.value;
  const style = printCodeFences(value, options);

  return [
    style,
    node.lang || "",
    node.meta ? " " + node.meta : "",
    hardline,
    replaceEndOfLine(value, hardline),
    hardline,
    style,
  ];
}

function printCode(path, options) {
  const { node } = path;

  if (node.isIndented) {
    const alignment = " ".repeat(4);
    return align(alignment, [
      alignment,
      replaceEndOfLine(node.value, hardline),
    ]);
  }

  return printFencedCodeBlock(path, options);
}

export { printCode, printCodeFences };
