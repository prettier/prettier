import { group, hardline } from "../../document/index.js";
import {
  adjustClause,
  printDoWhileStatementCondition,
  printWhileStatementCondition,
} from "./miscellaneous.js";

function printWhileStatement(path, options, print) {
  return group([
    "while (",
    printWhileStatementCondition(path, options, print),
    ")",
    adjustClause(path.node.body, print("body")),
  ]);
}

function printDoWhileStatement(path, options, print) {
  const { body } = path.node;
  const clause = adjustClause(body, print("body"));
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

export { printDoWhileStatement, printWhileStatement };
