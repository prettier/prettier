import printNumber from "../utils/print-number.js";
import printString from "../utils/print-string.js";
import hasNewline from "../utils/has-newline.js";
import isFrontMatter from "../utils/front-matter/is-front-matter.js";
import isNextLineEmpty from "../utils/is-next-line-empty.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  fill,
  indent,
  dedent,
  ifBreak,
  breakParent,
} from "../document/builders.js";
import { removeLines, getDocParts } from "../document/utils.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import { insertPragma } from "./pragma.js";
import getVisitorKeys from "./get-visitor-keys.js";

import {
  maybeToLowerCase,
  insideValueFunctionNode,
  insideICSSRuleNode,
  insideAtRuleNode,
  isKeyframeAtRuleKeywords,
  isWideKeywords,
  isLastNode,
  isSCSSControlDirectiveNode,
  isDetachedRulesetDeclarationNode,
  isURLFunctionNode,
  hasComposesNode,
  hasParensAroundNode,
  isKeyValuePairNode,
  isKeyInValuePairNode,
  isDetachedRulesetCallNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isSCSSMapItemNode,
  isMediaAndSupportsKeywords,
  lastLineHasInlineComment,
  isConfigurationNode,
  isVarFunctionNode,
} from "./utils/index.js";
import { locStart, locEnd } from "./loc.js";
import printUnit from "./utils/print-unit.js";
import printCommaSeparatedValueGroup from "./print/comma-separated-value-group.js";

function shouldPrintComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "front-matter":
      return [node.raw, hardline];
    case "css-root": {
      const nodes = printNodeSequence(path, options, print);
      let after = node.raws.after.trim();
      if (after.startsWith(";")) {
        after = after.slice(1).trim();
      }

      return [
        node.frontMatter ? [print("frontMatter"), hardline] : "",
        nodes,
        after ? ` ${after}` : "",
        node.nodes.length > 0 ? hardline : "",
      ];
    }
    case "css-comment": {
      const isInlineComment = node.inline || node.raws.inline;

      const text = options.originalText.slice(locStart(node), locEnd(node));

      return isInlineComment ? text.trimEnd() : text;
    }
    case "css-rule":
      return [
        print("selector"),
        node.important ? " !important" : "",
        node.nodes
          ? [
              node.selector?.type === "selector-unknown" &&
              lastLineHasInlineComment(node.selector.value)
                ? line
                : node.selector
                ? " "
                : "",
              "{",
              node.nodes.length > 0
                ? indent([hardline, printNodeSequence(path, options, print)])
                : "",
              hardline,
              "}",
              isDetachedRulesetDeclarationNode(node) ? ";" : "",
            ]
          : ";",
      ];

    case "css-decl": {
      const parentNode = path.parent;

      const { between: rawBetween } = node.raws;
      const trimmedBetween = rawBetween.trim();
      const isColon = trimmedBetween === ":";
      const isValueAllSpace =
        typeof node.value === "string" && /^ *$/.test(node.value);
      let value = typeof node.value === "string" ? node.value : print("value");

      value = hasComposesNode(node) ? removeLines(value) : value;

      if (!isColon && lastLineHasInlineComment(trimmedBetween)) {
        value = indent([hardline, dedent(value)]);
      }

      return [
        node.raws.before.replaceAll(/[\s;]/g, ""),
        // Less variable
        (parentNode.type === "css-atrule" && parentNode.variable) ||
        insideICSSRuleNode(path)
          ? node.prop
          : maybeToLowerCase(node.prop),
        trimmedBetween.startsWith("//") ? " " : "",
        trimmedBetween,
        node.extend || isValueAllSpace ? "" : " ",
        options.parser === "less" && node.extend && node.selector
          ? ["extend(", print("selector"), ")"]
          : "",
        value,
        node.raws.important
          ? node.raws.important.replace(/\s*!\s*important/i, " !important")
          : node.important
          ? " !important"
          : "",
        node.raws.scssDefault
          ? node.raws.scssDefault.replace(/\s*!default/i, " !default")
          : node.scssDefault
          ? " !default"
          : "",
        node.raws.scssGlobal
          ? node.raws.scssGlobal.replace(/\s*!global/i, " !global")
          : node.scssGlobal
          ? " !global"
          : "",
        node.nodes
          ? [
              " {",
              indent([softline, printNodeSequence(path, options, print)]),
              softline,
              "}",
            ]
          : isTemplatePropNode(node) &&
            !parentNode.raws.semicolon &&
            options.originalText[locEnd(node) - 1] !== ";"
          ? ""
          : options.__isHTMLStyleAttribute && isLastNode(path, node)
          ? ifBreak(";")
          : ";",
      ];
    }
    case "css-atrule": {
      const parentNode = path.parent;
      const isTemplatePlaceholderNodeWithoutSemiColon =
        isTemplatePlaceholderNode(node) &&
        !parentNode.raws.semicolon &&
        options.originalText[locEnd(node) - 1] !== ";";

      if (options.parser === "less") {
        if (node.mixin) {
          return [
            print("selector"),
            node.important ? " !important" : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.function) {
          return [
            node.name,
            typeof node.params === "string" ? node.params : print("params"),
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.variable) {
          return [
            "@",
            node.name,
            ": ",
            node.value ? print("value") : "",
            node.raws.between.trim() ? node.raws.between.trim() + " " : "",
            node.nodes
              ? [
                  "{",
                  indent([
                    node.nodes.length > 0 ? softline : "",
                    printNodeSequence(path, options, print),
                  ]),
                  softline,
                  "}",
                ]
              : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }
      }
      const isImportUnknownValueEndsWithSemiColon =
        node.name === "import" &&
        node.params?.type === "value-unknown" &&
        node.params.value.endsWith(";");

      return [
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as at-rules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCallNode(node) || node.name.endsWith(":")
          ? node.name
          : maybeToLowerCase(node.name),
        node.params
          ? [
              isDetachedRulesetCallNode(node)
                ? ""
                : isTemplatePlaceholderNode(node)
                ? node.raws.afterName === ""
                  ? ""
                  : node.name.endsWith(":")
                  ? " "
                  : /^\s*\n\s*\n/.test(node.raws.afterName)
                  ? [hardline, hardline]
                  : /^\s*\n/.test(node.raws.afterName)
                  ? hardline
                  : " "
                : " ",
              typeof node.params === "string" ? node.params : print("params"),
            ]
          : "",
        node.selector ? indent([" ", print("selector")]) : "",
        node.value
          ? group([
              " ",
              print("value"),
              isSCSSControlDirectiveNode(node, options)
                ? hasParensAroundNode(node)
                  ? " "
                  : line
                : "",
            ])
          : node.name === "else"
          ? " "
          : "",
        node.nodes
          ? [
              isSCSSControlDirectiveNode(node, options)
                ? ""
                : (node.selector &&
                    !node.selector.nodes &&
                    typeof node.selector.value === "string" &&
                    lastLineHasInlineComment(node.selector.value)) ||
                  (!node.selector &&
                    typeof node.params === "string" &&
                    lastLineHasInlineComment(node.params))
                ? line
                : " ",
              "{",
              indent([
                node.nodes.length > 0 ? softline : "",
                printNodeSequence(path, options, print),
              ]),
              softline,
              "}",
            ]
          : isTemplatePlaceholderNodeWithoutSemiColon ||
            isImportUnknownValueEndsWithSemiColon
          ? ""
          : ";",
      ];
    }
    // postcss-media-query-parser
    case "media-query-list": {
      const parts = [];
      path.each(({ node }) => {
        if (node.type === "media-query" && node.value === "") {
          return;
        }
        parts.push(print());
      }, "nodes");

      return group(indent(join(line, parts)));
    }
    case "media-query":
      return [
        join(" ", path.map(print, "nodes")),
        isLastNode(path, node) ? "" : ",",
      ];

    case "media-type":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-feature-expression":
      if (!node.nodes) {
        return node.value;
      }
      return ["(", ...path.map(print, "nodes"), ")"];

    case "media-feature":
      return maybeToLowerCase(
        adjustStrings(node.value.replaceAll(/ +/g, " "), options)
      );

    case "media-colon":
      return [node.value, " "];

    case "media-value":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-keyword":
      return adjustStrings(node.value, options);

    case "media-url":
      return adjustStrings(
        node.value.replaceAll(/^url\(\s+/gi, "url(").replaceAll(/\s+\)$/g, ")"),
        options
      );

    case "media-unknown":
      return node.value;

    // postcss-selector-parser
    case "selector-root":
      return group([
        insideAtRuleNode(path, "custom-selector")
          ? [
              path.findAncestor((node) => node.type === "css-atrule")
                .customSelector,
              line,
            ]
          : "",
        join(
          [
            ",",
            insideAtRuleNode(path, ["extend", "custom-selector", "nest"])
              ? line
              : hardline,
          ],
          path.map(print, "nodes")
        ),
      ]);

    case "selector-selector":
      return group(indent(path.map(print, "nodes")));

    case "selector-comment":
      return node.value;

    case "selector-string":
      return adjustStrings(node.value, options);

    case "selector-tag":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        path.previous?.type === "selector-nesting"
          ? node.value
          : adjustNumbers(
              isKeyframeAtRuleKeywords(path, node.value)
                ? node.value.toLowerCase()
                : node.value
            ),
      ];

    case "selector-id":
      return ["#", node.value];

    case "selector-class":
      return [".", adjustNumbers(adjustStrings(node.value, options))];

    case "selector-attribute":
      return [
        "[",
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.attribute.trim(),
        node.operator ?? "",
        node.value
          ? quoteAttributeValue(
              adjustStrings(node.value.trim(), options),
              options
            )
          : "",
        node.insensitive ? " i" : "",
        "]",
      ];

    case "selector-combinator": {
      if (
        node.value === "+" ||
        node.value === ">" ||
        node.value === "~" ||
        node.value === ">>>"
      ) {
        const parentNode = path.parent;
        const leading =
          parentNode.type === "selector-selector" &&
          parentNode.nodes[0] === node
            ? ""
            : line;

        return [leading, node.value, isLastNode(path, node) ? "" : " "];
      }

      const leading = node.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(node.value.trim(), options)) || line;

      return [leading, value];
    }
    case "selector-universal":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.value,
      ];

    case "selector-pseudo":
      return [
        maybeToLowerCase(node.value),
        isNonEmptyArray(node.nodes)
          ? group([
              "(",
              indent([softline, join([",", line], path.map(print, "nodes"))]),
              softline,
              ")",
            ])
          : "",
      ];

    case "selector-nesting":
      return node.value;

    case "selector-unknown": {
      const ruleAncestorNode = path.findAncestor(
        (node) => node.type === "css-rule"
      );

      // Nested SCSS property
      if (ruleAncestorNode?.isSCSSNesterProperty) {
        return adjustNumbers(
          adjustStrings(maybeToLowerCase(node.value), options)
        );
      }

      // originalText has to be used for Less, see replaceQuotesInInlineComments in loc.js
      const parentNode = path.parent;
      if (parentNode.raws?.selector) {
        const start = locStart(parentNode);
        const end = start + parentNode.raws.selector.length;
        return options.originalText.slice(start, end).trim();
      }

      // Same reason above
      const grandParent = path.grandparent;
      if (
        parentNode.type === "value-paren_group" &&
        grandParent?.type === "value-func" &&
        grandParent.value === "selector"
      ) {
        const start = locEnd(parentNode.open) + 1;
        const end = locStart(parentNode.close);
        const selector = options.originalText.slice(start, end).trim();

        return lastLineHasInlineComment(selector)
          ? [breakParent, selector]
          : selector;
      }

      return node.value;
    }
    // postcss-values-parser
    case "value-value":
    case "value-root":
      return print("group");

    case "value-comment":
      return options.originalText.slice(locStart(node), locEnd(node));

    case "value-comma_group":
      return printCommaSeparatedValueGroup(path, options, print);

    case "value-paren_group": {
      const parentNode = path.parent;
      const printedGroups = path.map(() => {
        const child = path.node;
        return typeof child === "string" ? child : print();
      }, "groups");

      if (
        parentNode &&
        isURLFunctionNode(parentNode) &&
        (node.groups.length === 1 ||
          (node.groups.length > 0 &&
            node.groups[0].type === "value-comma_group" &&
            node.groups[0].groups.length > 0 &&
            node.groups[0].groups[0].type === "value-word" &&
            node.groups[0].groups[0].value.startsWith("data:")))
      ) {
        return [
          node.open ? print("open") : "",
          join(",", printedGroups),
          node.close ? print("close") : "",
        ];
      }

      if (!node.open) {
        return group(indent(fill(join([",", line], printedGroups))));
      }

      const isSCSSMapItem = isSCSSMapItemNode(path, options);

      const lastItem = node.groups.at(-1);
      const isLastItemComment = lastItem?.type === "value-comment";
      const isKey = isKeyInValuePairNode(node, parentNode);
      const isConfiguration = isConfigurationNode(node, parentNode);
      const isVarFunction = isVarFunctionNode(parentNode);

      const shouldBreak = isConfiguration || (isSCSSMapItem && !isKey);
      const shouldDedent = isConfiguration || isKey;

      const printed = group(
        [
          node.open ? print("open") : "",
          indent([
            softline,
            join(
              [line],
              path.map(({ node: child, isLast, index }) => {
                const hasComma = () =>
                  Boolean(
                    child.source &&
                      options.originalText
                        .slice(locStart(child), locStart(node.close))
                        .trimEnd()
                        .endsWith(",")
                  );
                const shouldPrintComma =
                  !isLast || (isVarFunction && hasComma());
                let printed = [
                  printedGroups[index],
                  shouldPrintComma ? "," : "",
                ];

                // Key/Value pair in open paren already indented
                if (
                  isKeyValuePairNode(child) &&
                  child.type === "value-comma_group" &&
                  child.groups &&
                  child.groups[0].type !== "value-paren_group" &&
                  child.groups[2]?.type === "value-paren_group"
                ) {
                  const parts = getDocParts(printed[0].contents.contents);
                  parts[1] = group(parts[1]);
                  printed = [group(dedent(printed))];
                }

                if (
                  !isLast &&
                  child.type === "value-comma_group" &&
                  isNonEmptyArray(child.groups)
                ) {
                  let last = child.groups.at(-1);

                  // `value-paren_group` does not have location info, but its closing parenthesis does.
                  if (!last.source && last.close) {
                    last = last.close;
                  }

                  if (
                    last.source &&
                    isNextLineEmpty(options.originalText, locEnd(last))
                  ) {
                    printed.push(hardline);
                  }
                }

                return printed;
              }, "groups")
            ),
          ]),
          ifBreak(
            !isLastItemComment &&
              options.parser === "scss" &&
              isSCSSMapItem &&
              shouldPrintComma(options)
              ? ","
              : ""
          ),
          softline,
          node.close ? print("close") : "",
        ],
        {
          shouldBreak,
        }
      );

      return shouldDedent ? dedent(printed) : printed;
    }
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
      return [
        node.value,
        // Don't add spaces on escaped colon `:`, e.g: grid-template-rows: [row-1-00\:00] auto;
        (typeof previous?.value === "string" &&
          previous.value.endsWith("\\")) ||
        // Don't add spaces on `:` in `url` function (i.e. `url(fbglyph: cross-outline, fig-white)`)
        insideValueFunctionNode(path, "url")
          ? ""
          : line,
      ];
    }
    case "value-string":
      return printString(
        node.raws.quote + node.value + node.raws.quote,
        options
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
      throw new UnexpectedNodeError(node, "PostCSS");
  }
}

function printNodeSequence(path, options, print) {
  const parts = [];
  path.each(() => {
    const { node, previous } = path;
    if (
      previous?.type === "css-comment" &&
      previous.text.trim() === "prettier-ignore"
    ) {
      parts.push(options.originalText.slice(locStart(node), locEnd(node)));
    } else {
      parts.push(print());
    }

    if (path.isLast) {
      return;
    }

    const { next } = path;
    if (
      (next.type === "css-comment" &&
        !hasNewline(options.originalText, locStart(next), {
          backwards: true,
        }) &&
        !isFrontMatter(node)) ||
      (next.type === "css-atrule" &&
        next.name === "else" &&
        node.type !== "css-comment")
    ) {
      parts.push(" ");
    } else {
      parts.push(options.__isHTMLStyleAttribute ? line : hardline);
      if (
        isNextLineEmpty(options.originalText, locEnd(node)) &&
        !isFrontMatter(node)
      ) {
        parts.push(hardline);
      }
    }
  }, "nodes");

  return parts;
}

const STRING_REGEX = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gs;
const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:[Ee][+-]?\d+)?/g;
const STANDARD_UNIT_REGEX = /[A-Za-z]+/g;
const WORD_PART_REGEX = /[$@]?[A-Z_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/g;
const ADJUST_NUMBERS_REGEX = new RegExp(
  STRING_REGEX.source +
    "|" +
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "g"
);

function adjustStrings(value, options) {
  return value.replaceAll(STRING_REGEX, (match) => printString(match, options));
}

function quoteAttributeValue(value, options) {
  const quote = options.singleQuote ? "'" : '"';
  return value.includes('"') || value.includes("'")
    ? value
    : quote + value + quote;
}

function adjustNumbers(value) {
  return value.replace(
    ADJUST_NUMBERS_REGEX,
    (match, quote, wordPart, number, unit) =>
      !wordPart && number
        ? printCssNumber(number) + maybeToLowerCase(unit || "")
        : match
  );
}

function printCssNumber(rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/, "")
  );
}

const printer = {
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  getVisitorKeys,
};

export default printer;
