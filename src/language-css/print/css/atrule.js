import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  lineSuffixBoundary,
  softline,
} from "../../../document/index.js";
import { locEnd } from "../../loc.js";
import {
  hasParensAroundNode,
  isDetachedRulesetCallNode,
  isSCSSControlDirectiveNode,
  isTemplatePlaceholderNode,
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "../../utilities/index.js";
import printSequence from "../sequence.js";

function printCssAtrule(path, options, print) {
  const { node } = path;
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
      const groupId = Symbol("variable-value-group");
      const between = node.raws.between.trim();

      return [
        "@",
        node.name,
        ": ",
        node.value
          ? [
              print("value"),
              group(lineSuffixBoundary, { id: groupId }),
              between || node.nodes ? ifBreak("", " ", { groupId }) : "",
            ]
          : "",
        between ? between + (node.nodes ? " " : "") : "",
        node.nodes
          ? [
              "{",
              node.nodes.length > 0
                ? indent([softline, printSequence(path, options, print)])
                : "",
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
    isDetachedRulesetCallNode(node) ||
    node.name.endsWith(":") ||
    isTemplatePlaceholderNode(node)
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
    node.selector
      ? indent([" ", print("selector"), node.optional ? " !optional" : ""])
      : "",
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
          node.nodes.length > 0
            ? indent([softline, printSequence(path, options, print)])
            : "",
          softline,
          "}",
        ]
      : isTemplatePlaceholderNodeWithoutSemiColon ||
          isImportUnknownValueEndsWithSemiColon
        ? ""
        : ";",
  ];
}

export { printCssAtrule };
