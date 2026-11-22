import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { group, line, lineSuffix } from "../document/index.js";
import printString from "../utilities/print-string.js";
import { locEnd, locStart } from "./loc.js";
import printCommaSeparatedValueGroup from "./print/comma-separated-value-group.js";
import { printCssNumber, printUnit } from "./print/misc.js";
import { printParenthesizedValueGroup } from "./print/parenthesized-value-group.js";
import {
  insideAtRuleNode,
  insideValueFunctionNode,
  isMediaAndSupportsKeywords,
  isWideKeywords,
} from "./utilities/index.js";

function printValueNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "value-value":
    case "value-root":
      return print("group");

    case "value-comment": {
      const text = options.originalText.slice(locStart(node), locEnd(node));
      return node.inline ? lineSuffix(text.trimEnd()) : text;
    }
    case "value-comma_group":
      return printCommaSeparatedValueGroup(path, options, print);

    case "value-paren_group":
      return printParenthesizedValueGroup(path, options, print);

    case "value-func":
      return [
        node.value,
        insideAtRuleNode(path, "supports") && isMediaAndSupportsKeywords(node)
          ? " "
          : "",
        print("group"),
      ];

    case "value-paren":
      return node.value;

    case "value-number":
      return [printCssNumber(node.value), printUnit(node.unit)];

    case "value-operator":
      return node.value;

    case "value-word":
      if ((node.isColor && node.isHex) || isWideKeywords(node.value)) {
        return node.value.toLowerCase();
      }

      return node.value;

    case "value-colon": {
      const { previous } = path;
      return group([
        node.value,
        // Don't add spaces on escaped colon `:`, e.g: grid-template-rows: [row-1-00\:00] auto;
        (typeof previous?.value === "string" &&
          previous.value.endsWith("\\")) ||
        // Don't add spaces on `:` in `url` function (i.e. `url(fbglyph: cross-outline, fig-white)`)
        insideValueFunctionNode(path, "url")
          ? ""
          : line,
      ]);
    }
    case "value-string":
      return printString(
        node.raws.quote + node.value + node.raws.quote,
        options,
      );

    case "value-atword":
      return ["@", node.value];

    case "value-unicode-range":
      return node.value;

    case "value-unknown":
      return node.value;

    case "value-comma": // Handled in `value-comma_group`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "CSS");
  }
}

export { printValueNode };
