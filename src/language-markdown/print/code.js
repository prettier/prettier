import { align, hardline, replaceEndOfLine } from "../../document/index.js";
import getMaxContinuousCount from "../../utilities/get-max-continuous-count.js";
import { getFencedCodeBlockValue } from "../utilities.js";

function printCodeFences(path, options) {
  const styleUnit = options.__inJsTemplate ? "~" : "`";

  return styleUnit.repeat(
    Math.max(3, getMaxContinuousCount(path.node.value, styleUnit) + 1),
  );
}

function printFencedCodeBlock(path, options) {
  const { node } = path;

  const styleUnit = options.__inJsTemplate ? "~" : "`";
  const style = styleUnit.repeat(
    Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1),
  );

  return [
    style,
    node.lang || "",
    node.meta ? " " + node.meta : "",
    hardline,
    replaceEndOfLine(
      options.parser === "mdx"
        ? getFencedCodeBlockValue(node, options.originalText)
        : node.value,
      hardline,
    ),
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
