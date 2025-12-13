/**
 * @import AstPath from "../../common/ast-path.js";
 * @import {Doc} from "../../document/index.js";
 */

/**
 * @param {AstPath} path
 * @param {*} options
 * @returns {Doc}
 */
function printPrettierIgnored(path, options) {
  const originalText = options.originalText.slice(
    path.node.position.start.offset,
    path.node.position.end.offset,
  );

  if (options.parser === "mdx") {
    return originalText;
  }

  switch (path.node.type) {
    case "list":
      if (
        path.findAncestor((p) => p.type === "blockquote") &&
        options.proseWrap !== "always"
      ) {
        return originalText.replace(/\n>\s*$/u, "");
      }
      return originalText;
    default:
      return originalText;
  }
}

export { printPrettierIgnored };
