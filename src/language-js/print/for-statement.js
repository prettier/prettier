import {
  group,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { adjustClause } from "./miscellaneous.js";

function printForStatement(path, options, print) {
  const { node } = path;
  const body = adjustClause(node.body, print("body"));

  // We want to keep dangling comments above the loop to stay consistent.
  // Any comment positioned between the for statement and the parentheses
  // is going to be printed before the statement.
  const dangling = printDanglingComments(path, options);
  const printedComments = dangling ? [dangling, softline] : "";

  if (!node.init && !node.test && !node.update) {
    return [printedComments, group(["for (;;)", body])];
  }

  return [
    printedComments,
    group([
      "for (",
      group([
        indent([
          softline,
          print("init"),
          ";",
          line,
          print("test"),
          ";",
          node.update ? [line, print("update")] : ifBreak("", line),
        ]),
        softline,
      ]),
      ")",
      body,
    ]),
  ];
}

export { printForStatement };
