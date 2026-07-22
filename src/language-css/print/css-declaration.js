import {
  dedent,
  group,
  hardline,
  ifBreak,
  indent,
  removeLines,
  softline,
} from "../../document/index.js";
import { locEnd } from "../loc.js";
import {
  hasComposesNode,
  insideIcssRuleNode,
  isAtWordPlaceholderNode,
  isTemplatePropNode,
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "../utilities/index.js";
import { shouldBreakList } from "./parenthesized-value-group.js";
import printSequence from "./sequence.js";

function printCssDeclaration(path, options, print) {
  const { node } = path;
  const parentNode = path.parent;

  const { between: rawBetween } = node.raws;
  const trimmedBetween = rawBetween.trim();
  const isColon = trimmedBetween === ":";
  const hasSpaceAfterColon = rawBetween.endsWith(" ") && isColon;
  const isValueAllSpace =
    typeof node.value === "string" && /^ *$/.test(node.value);
  let value = typeof node.value === "string" ? node.value : print("value");

  value = hasComposesNode(node) ? removeLines(value) : value;

  if (
    !isColon &&
    lastLineHasInlineComment(trimmedBetween) &&
    !path.call(() => shouldBreakList(path), "value", "group", "group")
  ) {
    value = indent([hardline, dedent(value)]);
  }

  const parts = [
    node.raws.before.replaceAll(/[\s;]/g, ""),
    // Less variable
    (parentNode.type === "css-atrule" && parentNode.variable) ||
    insideIcssRuleNode(path)
      ? node.prop
      : maybeToLowerCase(node.prop),
  ];

  if (trimmedBetween.startsWith("//")) {
    parts.push(" ");
  }

  parts.push(trimmedBetween);

  if (!(
    node.extend ||
    isValueAllSpace ||
    (!hasSpaceAfterColon &&
      node.isNested &&
      (isAtWordPlaceholderNode(node.value.group.group) ||
        isAtWordPlaceholderNode(node.value.group.group.groups?.[0])))
  )) {
    parts.push(" ");
  }

  if (options.parser === "less" && node.extend && node.selector) {
    parts.push(
      node.selector.nodes.length > 1
        ? group([
            "extend(",
            indent([softline, print("selector")]),
            softline,
            ")",
          ])
        : ["extend(", print("selector"), ")"],
    );
  }

  parts.push(value);

  if (node.raws.important) {
    parts.push(node.raws.important.replace(/\s*!\s*important/i, " !important"));
  } else if (node.important) {
    parts.push(" !important");
  }

  if (node.raws.scssDefault) {
    parts.push(node.raws.scssDefault.replace(/\s*!default/i, " !default"));
  } else if (node.scssDefault) {
    parts.push(" !default");
  }

  if (node.raws.scssGlobal) {
    parts.push(node.raws.scssGlobal.replace(/\s*!global/i, " !global"));
  } else if (node.scssGlobal) {
    parts.push(" !global");
  }

  if (node.nodes) {
    parts.push([
      " {",
      node.nodes.length > 0
        ? indent([softline, printSequence(path, options, print)])
        : "",
      softline,
      "}",
    ]);
  } else if (!(
    isTemplatePropNode(node) &&
    !parentNode.raws.semicolon &&
    options.originalText[locEnd(node) - 1] !== ";"
  )) {
    parts.push(
      options.__isHTMLStyleAttribute && path.isLast ? ifBreak(";") : ";",
    );
  }

  return parts;
}

export { printCssDeclaration };
