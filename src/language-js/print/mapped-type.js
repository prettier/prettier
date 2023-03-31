import { printDanglingComments } from "../../main/comments/print.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locStart, locEnd } from "../loc.js";
import {
  group,
  softline,
  indent,
  ifBreak,
  line,
} from "../../document/builders.js";

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
  const shouldBreak = hasNewlineInRange(
    options.originalText,
    locStart(node),
    locEnd(node)
  );
  return group(
    [
      node.variance ? print("variance") : "",
      "[",
      indent([
        ifBreak(softline),
        print("keyTparam"),
        " in ",
        ifBreak(softline),
        print("sourceType"),
      ]),
      ifBreak(softline),
      "]",
      printFlowMappedTypeOptionalModifier(node.optional),
      ": ",
      print("propType"),
    ],
    { shouldBreak }
  );
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

function printTypescriptMappedType(path, options, print) {
  const { node } = path;
  const shouldBreak = hasNewlineInRange(
    options.originalText,
    locStart(node),
    locEnd(node)
  );

  return group(
    [
      "{",
      indent([
        options.bracketSpacing ? line : softline,
        print("typeParameter"),
        node.optional
          ? printTypeScriptMappedTypeModifier(node.optional, "?")
          : "",
        node.typeAnnotation ? ": " : "",
        print("typeAnnotation"),
        options.semi ? ifBreak(";") : "",
      ]),
      printDanglingComments(path, options),
      options.bracketSpacing ? line : softline,
      "}",
    ],
    { shouldBreak }
  );
}

export {
  printFlowMappedTypeProperty,
  printTypeScriptMappedTypeModifier,
  printTypescriptMappedType,
};
