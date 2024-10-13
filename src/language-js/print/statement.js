import { hardline } from "../../document/builders.js";
import { isNextLineEmpty } from "../utils/index.js";

/**
 * @import {Doc} from "../../document/builders.js"
 * @import AstPath from "../../common/ast-path.js")
 */

/*
- `Program` ("directives" and "body")
- `BlockStatement`
- `StaticBlock`
- `SwitchCase` ("consequent")
- `TSModuleBlock` (TypeScript)
*/
function printStatementSequence(path, options, print, property) {
  const { node } = path;
  const parts = [];
  const lastStatement = node[property].findLast(
    (statement) => statement.type !== "EmptyStatement",
  );

  path.each(({ node }) => {
    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (node.type === "EmptyStatement") {
      return;
    }

    parts.push(print());

    if (node !== lastStatement) {
      parts.push(hardline);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  }, property);

  return parts;
}

export { printStatementSequence };
