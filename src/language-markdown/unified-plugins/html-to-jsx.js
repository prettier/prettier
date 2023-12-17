import { COMMENT_REGEX } from "../mdx.js";
import { INLINE_NODE_WRAPPER_TYPES, mapAst } from "../utils.js";

function htmlToJsx() {
  return (ast) =>
    mapAst(ast, (node, _index, [parent]) => {
      if (
        node.type !== "html" ||
        // Keep HTML-style comments (legacy MDX)
        COMMENT_REGEX.test(node.value) ||
        INLINE_NODE_WRAPPER_TYPES.has(parent.type)
      ) {
        return node;
      }
      return { ...node, type: "jsx" };
    });
}

export default htmlToJsx;
