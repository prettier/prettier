import { group, hardline, indent, softline } from "../../document/index.js";
import { adjustClause } from "./misc.js";

function printWhileStatement(path, options, print) {
  return group([
    "while (",
    group([indent([softline, print("test")]), softline]),
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
    group([indent([softline, print("test")]), softline]),
    ")",
    options.semi ? ";" : "",
  ];
}

export { printDoWhileStatement, printWhileStatement };
