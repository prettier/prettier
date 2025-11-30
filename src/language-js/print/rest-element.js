import { printTypeAnnotationProperty } from "./type-annotation.js";

function printRestOrSpreadElement(path, print) {
  return ["...", print("argument"), printTypeAnnotationProperty(path, print)];
}

export {
  printRestOrSpreadElement as printRestElement,
  printRestOrSpreadElement as printSpreadElement,
};
