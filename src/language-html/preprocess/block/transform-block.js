import { transformIfBlock } from "./transform-if-block.js";
import { transoformForLoopBlock } from "./transform-for-block.js";
import { transformDeferredBlock } from "./transform-defer-block.js";

/**
 * The angular-html-parser parses nested blocks as arrays.
 * In Prettier's print logic, handling such ASTs is annoying.
 * Therefore, converts the arrays into nested blocks.
 */
function transformControlFlowBlockNode(ast) {
  ast.walk((node) => {
    if (node.type === "block") {
      switch (node.name) {
        case "if":
          transformIfBlock(node);
          break;
        case "defer":
          transformDeferredBlock(node);
          break;
        case "for":
          transoformForLoopBlock(node);
          break;
      }
    }
  });
}

export { transformControlFlowBlockNode };
