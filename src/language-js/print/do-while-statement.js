import { group, hardline } from "../../document/index.js";
import {
  printClause,
  printDoWhileStatementCondition,
} from "./miscellaneous.js";

function printDoWhileStatement(path, options, print) {
  return [
    group(["do", printClause(path, print)]),
    path.node.body.type === "BlockStatement" ? " " : hardline,
    "while (",
    printDoWhileStatementCondition(path, options, print),
    ")",
    options.semi ? ";" : "",
  ];
}

export { printDoWhileStatement };
