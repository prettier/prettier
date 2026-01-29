import { group } from "../../document/index.js";
import { adjustClause, printWhileStatementCondition } from "./miscellaneous.js";

function printWhileStatement(path, options, print) {
  const { node } = path;
  const keyword = node.type === "WithStatement" ? "with" : "while";

  return group([
    keyword,
    " (",
    printWhileStatementCondition(path, options, print),
    ")",
    adjustClause(node.body, print("body")),
  ]);
}

export { printWhileStatement };
