import { group, hardline } from "../../document/index.js";
import {
  printClause,
  printDoWhileStatementCondition,
} from "./miscellaneous.js";

function printDoWhileStatement(path, options, print) {
  const { body } = path.node;
  const clause = printClause(path, print);
  const doBody = group(["do", clause]);

  return [
    doBody,
    body.type === "BlockStatement" ? " " : hardline,
    "while (",
    printDoWhileStatementCondition(path, options, print),
    ")",
    options.semi ? ";" : "",
  ];
}

export { printDoWhileStatement };
