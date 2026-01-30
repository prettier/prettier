import { group } from "../../document/index.js";
import { printWhileStatementBody } from "./clause.js";
import { printWhileStatementCondition } from "./miscellaneous.js";

function printWhileStatement(path, options, print) {
  const { node } = path;
  const keyword = node.type === "WithStatement" ? "with" : "while";

  return group([
    keyword,
    " (",
    printWhileStatementCondition(path, options, print),
    ")",
    printWhileStatementBody(path, print),
  ]);
}

export { printWhileStatement };
