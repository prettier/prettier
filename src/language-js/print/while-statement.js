import { group } from "../../document/index.js";
import { printClause, printWhileStatementCondition } from "./miscellaneous.js";

function printWhileStatement(path, options, print) {
  const { node } = path;
  const keyword = node.type === "WithStatement" ? "with" : "while";

  return group([
    keyword,
    " (",
    printWhileStatementCondition(path, options, print),
    ")",
    printClause(path, print),
  ]);
}

export { printWhileStatement };
