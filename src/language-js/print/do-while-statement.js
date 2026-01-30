import { group, hardline } from "../../document/index.js";
import { printDoWhileStatementBody } from "./clause.js";
import { printDoWhileStatementCondition } from "./miscellaneous.js";

function printDoWhileStatement(path, options, print) {
  return [
    group(["do", printDoWhileStatementBody(path, options, print)]),
    path.node.body.type === "BlockStatement" ? " " : hardline,
    "while (",
    printDoWhileStatementCondition(path, options, print),
    ")",
    options.semi ? ";" : "",
  ];
}

export { printDoWhileStatement };
