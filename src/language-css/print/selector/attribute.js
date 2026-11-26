import {
  literallineWithoutBreakParent,
  replaceEndOfLine,
} from "../../../document/index.js";
import { adjustStrings, quoteAttributeValue } from "../misc.js";
import { printSelectorNamespace } from "./namespace.js";

function printAttributeSelector(path, options /* , print */) {
  const { node } = path;

  const value = node.raws.value ?? node.value;

  // postcss-selector-parser only keeps `I`, `S` and unknown flags in raws,
  // unknown flags are stored in `raws.insensitiveFlag` as well
  // https://github.com/postcss/postcss-selector-parser/blob/44deaeb329a74aedb1e21709028bd2566a6b24fc/src/parser.js#L423-L442
  const flag = node.sensitive
    ? (node.raws.sensitiveFlag ?? "s")
    : (node.raws.insensitiveFlag ?? (node.insensitive ? "i" : ""));

  return [
    "[",
    printSelectorNamespace(node),
    (node.raws.attribute ?? node.attribute).trim(),
    node.operator ?? "",
    value
      ? replaceEndOfLine(
          quoteAttributeValue(adjustStrings(value.trim(), options), options),
          literallineWithoutBreakParent,
        )
      : "",
    flag ? [" ", flag] : "",
    "]",
  ];
}

export { printAttributeSelector };
