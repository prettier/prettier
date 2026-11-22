import { group, indent, join, line, lineSuffix } from "../document/index.js";
import printString from "../utilities/print-string.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import printCommaSeparatedValueGroup from "./print/comma-separated-value-group.js";
import { printCssNode } from "./print/css-node.js";
import { printMediaQueryNode } from "./print/media-query-node.js";
import { printCssNumber, printUnit } from "./print/misc.js";
import { printParenthesizedValueGroup } from "./print/parenthesized-value-group.js";
import { printSelectorNode } from "./print/selector-node.js";
import {
  insideAtRuleNode,
  insideValueFunctionNode,
  isMediaAndSupportsKeywords,
  isWideKeywords,
} from "./utilities/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  if (node.type.startsWith("css-")) {
    return printCssNode(path, options, print);
  }

  if (node.type.startsWith("selector-")) {
    return printSelectorNode(path, options, print);
  }

  if (node.type.startsWith("media-")) {
    return printMediaQueryNode(path, options, print);
  }

  switch (node.type) {
    // postcss-values-parser
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

    case "front-matter": // Handled in core
    case "value-comma": // Handled in `value-comma_group`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "PostCSS");
  }
}

const printer = {
  features: {
    experimental_frontMatterSupport: {
      massageAstNode: true,
      embed: true,
      print: true,
    },
  },
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode,
  getVisitorKeys,
};

export default printer;
