import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import { CommentCheckFlags, getComments } from "../utilities/comments.js";
import { isLineComment } from "../utilities/is-line-comment.js";
import { stripComments } from "../utilities/strip-comments.js";
import { printClassMemberSemicolon } from "./class.js";

/**
@import {Doc} from "../../document/index.js"
*/

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
  return [
    group([
      node.variance ? print("variance") : "",
      "[",
      indent([print("keyTparam"), " in ", print("sourceType")]),
      "]",
      printFlowMappedTypeOptionalModifier(node.optional),
      ": ",
      print("propType"),
    ]),
    printClassMemberSemicolon(path, options),
  ];
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
    const text = stripComments(options);
    // Skip `{`
    const start = locStart(node) + 1;
    const textAfter = text.slice(start);
    const nextTokenIndex = start + textAfter.search(/\S/);
    if (hasNewlineInRange(options.originalText, start, nextTokenIndex)) {
      shouldBreak = true;
    }
  }

  /** @type {Doc[]} */
  const danglingCommentsDoc = [];
  const danglingComments = getComments(node, CommentCheckFlags.Dangling);
  if (danglingComments.length > 0) {
    const lastComment = danglingComments.at(-1);
    const parts = /** @type {Doc[]} */ (printDanglingComments(path, options));
    danglingCommentsDoc.push(
      ...parts.slice(0, -1),
      group([
        parts.at(-1),
        isLineComment(lastComment) ||
        hasNewline(options.originalText, locEnd(lastComment))
          ? hardline
          : line,
      ]),
    );
  }

  return group(
    [
      "{",
      indent([
        options.bracketSpacing ? line : softline,
        ...danglingCommentsDoc,
        node.readonly
          ? [printTypeScriptMappedTypeModifier(node.readonly, "readonly"), " "]
          : "",
        group([
          "[",
          indent([
            softline,
            print("key"),
            " in ",
            print("constraint"),
            node.nameType ? [" as ", print("nameType")] : "",
          ]),
          softline,
          "]",
        ]),
        node.optional
          ? printTypeScriptMappedTypeModifier(node.optional, "?")
          : "",
        node.typeAnnotation ? ": " : "",
        print("typeAnnotation"),
        options.semi ? ifBreak(";") : "",
      ]),
      options.bracketSpacing ? line : softline,
      "}",
    ],
    { shouldBreak },
  );
}

export { printFlowMappedTypeProperty, printTypeScriptMappedType };
