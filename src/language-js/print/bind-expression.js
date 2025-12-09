import { group, indent, softline } from "../../document/index.js";

function printBindExpression(path, options, print) {
  return [
    print("object"),
    group(indent([softline, printBindExpressionCallee(path, options, print)])),
  ];
}

function printBindExpressionCallee(path, options, print) {
  return ["::", print("callee")];
}

export { printBindExpression, printBindExpressionCallee };
