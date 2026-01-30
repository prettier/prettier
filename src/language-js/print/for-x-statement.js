import { group } from "../../document/index.js";
import { printForXStatementBody } from "./clause.js";

function printForXStatement(path, options, print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  return group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    print("left"),
    isForOfStatement ? " of " : "in",
    print("right"),
    ")",
    printForXStatementBody(path, options, print),
  ]);
}

export { printForXStatement };
