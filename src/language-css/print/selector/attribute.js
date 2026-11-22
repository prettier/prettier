import {
  literallineWithoutBreakParent,
  replaceEndOfLine,
} from "../../../document/index.js";
import { adjustStrings, quoteAttributeValue } from "../misc.js";

function printAttributeSelector(path, options /* , print*/) {
  const { node } = path;

  return [
    "[",
    node.namespace
      ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
      : "",
    node.attribute.trim(),
    node.operator ?? "",
    node.value
      ? replaceEndOfLine(
          quoteAttributeValue(
            adjustStrings(node.value.trim(), options),
            options,
          ),
          literallineWithoutBreakParent,
        )
      : "",
    node.insensitive ? " i" : "",
    "]",
  ];
}

export { printAttributeSelector };
