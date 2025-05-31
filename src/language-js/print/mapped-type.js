import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locStart } from "../loc.js";
import getTextWithoutComments from "../utils/get-text-without-comments.js";
import { CommentCheckFlags, hasComment } from "../utils/index.js";

/**
 * @param {string | null} optional
 * @returns {string}
 */
function printFlowMappedTypeOptionalModifier(optional) {
  switch (optional) {
    case null:
      return "";
    case "PlusOptional":
      return "+?";
    case "MinusOptional":
      return "-?";
    case "Optional":
      return "?";
  }
}

function printFlowMappedTypeProperty(path, options, print) {
  const { node } = path;
  return group([
    node.variance ? print("variance") : "",
    "[",
    indent([print("keyTparam"), " in ", print("sourceType")]),
    "]",
    printFlowMappedTypeOptionalModifier(node.optional),
    ": ",
    print("propType"),
  ]);
}

/**
 * @param {string} tokenNode
 * @param {string} keyword
 * @returns {string}
 */
function printTypeScriptMappedTypeModifier(tokenNode, keyword) {
  if (tokenNode === "+" || tokenNode === "-") {
    return tokenNode + keyword;
  }

  return keyword;
}

function printTypeScriptMappedType(path, options, print) {
  const { node } = path;
  // Break after `{` like `printObject`
  let shouldBreak = false;
  if (options.objectWrap === "preserve") {
    const start = locStart(node);
    const textAfter = getTextWithoutComments(
      options,
      start + 1,
      locStart(node.key),
    );
    const nextTokenIndex = start + 1 + textAfter.search(/\S/u);
    if (hasNewlineInRange(options.originalText, start, nextTokenIndex)) {
      shouldBreak = true;
    }
  }

  return group(
    [
      "{",
      indent([
        options.bracketSpacing ? line : softline,
        hasComment(node, CommentCheckFlags.Dangling)
          ? group([printDanglingComments(path, options), hardline])
          : "",
        group([
          node.readonly
            ? [
                printTypeScriptMappedTypeModifier(node.readonly, "readonly"),
                " ",
              ]
            : "",
          "[",
          print("key"),
          " in ",
          print("constraint"),
          node.nameType ? [" as ", print("nameType")] : "",
          "]",
          node.optional
            ? printTypeScriptMappedTypeModifier(node.optional, "?")
            : "",
          node.typeAnnotation ? ": " : "",
          print("typeAnnotation"),
        ]),
        options.semi ? ifBreak(";") : "",
      ]),
      options.bracketSpacing ? line : softline,
      "}",
    ],
    { shouldBreak },
  );
}

export { printFlowMappedTypeProperty, printTypeScriptMappedType };
