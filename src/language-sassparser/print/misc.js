import { ifBreak } from "../../document/builders.js";
import printNumber from "../../utils/print-number.js";
import { hasComma, isVarFunctionNode } from "../utils/index.js";
import CSS_UNITS from "./css-units.evaluate.js";

function printUnit(unit) {
  const lowercased = unit.toLowerCase();
  return CSS_UNITS.has(lowercased) ? CSS_UNITS.get(lowercased) : unit;
}

function printCssNumber(rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/u, "")
  );
}

function shouldPrintTrailingComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

function printTrailingComma(path, options) {
  if (isVarFunctionNode(path.grandparent) && hasComma(path, options)) {
    return ",";
  }
  if (
    path.node.type !== "comment" &&
    shouldPrintTrailingComma(options) &&
    path.callParent(
      () => path.node.sassType === "map" || path.node.sassType === "list",
    )
  ) {
    return ifBreak(",");
  }

  return "";
}

export {
  printCssNumber,
  printTrailingComma,
  printUnit,
  shouldPrintTrailingComma,
};
