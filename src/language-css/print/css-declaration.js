import {
  dedent,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_INDENT,
  getDocType,
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

function appendSuffixToValue(value, suffix) {
  if (
    getDocType(value) === DOC_TYPE_GROUP &&
    getDocType(value.contents) === DOC_TYPE_INDENT &&
    getDocType(value.contents.contents) === DOC_TYPE_FILL
  ) {
    const fill = value.contents.contents;

    // `fill` only measures its own parts, so include the declaration suffix
    // in the final value chunk that decides whether the last line fits.
    return {
      ...value,
      contents: {
        ...value.contents,
        contents: {
          ...fill,
          parts: [...fill.parts.slice(0, -1), [fill.parts.at(-1), suffix]],
        },
      },
    };
  }

  return [value, suffix];
}

function printCssDeclaration(path, options, print) {
  const { node, parent } = path;

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
    (parent.type === "css-atrule" && parent.variable) ||
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

  const suffix = [];

  if (node.raws.important) {
    suffix.push(
      node.raws.important.replace(/\s*!\s*important/i, " !important"),
    );
  } else if (node.important) {
    suffix.push(" !important");
  }

  if (node.raws.scssDefault) {
    suffix.push(node.raws.scssDefault.replace(/\s*!default/i, " !default"));
  } else if (node.scssDefault) {
    suffix.push(" !default");
  }

  if (node.raws.scssGlobal) {
    suffix.push(node.raws.scssGlobal.replace(/\s*!global/i, " !global"));
  } else if (node.scssGlobal) {
    suffix.push(" !global");
  }

  if (node.nodes) {
    parts.push(value, suffix, [
      " {",
      node.nodes.length > 0
        ? indent([softline, printSequence(path, options, print)])
        : "",
      softline,
      "}",
    ]);
  } else {
    const shouldPrintSemicolon = !(
      isTemplatePropNode(node) &&
      !parent.raws.semicolon &&
      options.originalText[locEnd(node) - 1] !== ";"
    );

    const conditionalSemicolon =
      shouldPrintSemicolon && options.__isHTMLStyleAttribute && path.isLast;

    if (conditionalSemicolon) {
      parts.push(
        ifBreak(
          appendSuffixToValue(value, [...suffix, ";"]),
          suffix.length > 0 ? appendSuffixToValue(value, suffix) : value,
        ),
      );
    } else {
      if (shouldPrintSemicolon) {
        suffix.push(";");
      }

      parts.push(
        suffix.length > 0 ? appendSuffixToValue(value, suffix) : value,
      );
    }
  }

  return parts;
}

export { printCssDeclaration };
