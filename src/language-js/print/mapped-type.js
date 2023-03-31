import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locStart, locEnd } from "../loc.js";
import { group, softline, indent, ifBreak } from "../../document/builders.js";

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

export { printFlowMappedTypeProperty };
