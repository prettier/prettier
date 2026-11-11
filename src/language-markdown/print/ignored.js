import {
  literalline,
  markAsRoot,
  replaceEndOfLine,
} from "../../document/index.js";

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

  switch (path.node.type) {
    case "code":
      if (
        options.parser === "mdx" &&
        path.findAncestor((node) => node.type === "mdxJsxFlowElement")
      ) {
        const lines = originalText.split("\n");
        const openingFence = /^(?:`{3,}|~{3,})/.exec(lines[0])?.[0];
        const closingFence = /(?:`{3,}|~{3,})[\t ]*$/.exec(lines.at(-1))?.[0];
        const { value } = path.node;
        // An unclosed block can end when its list or block quote ends. A
        // fence-like suffix of its final content line is not a closing fence:
        // a real closing fence occupies a line excluded from the parsed value.
        const hasClosingFence =
          openingFence &&
          closingFence?.startsWith(openingFence) &&
          (lines.length === value.split("\n").length + 2 ||
            (value === "" && lines.length === 2));
        if (hasClosingFence) {
          // The parsed value excludes the original container indentation.
          // Literal lines preserve code whitespace while adopting the new
          // indentation of the surrounding JSX, list, or block quote.
          return markAsRoot([
            lines[0],
            literalline,
            lines.length > 2 ? [replaceEndOfLine(value), literalline] : "",
            closingFence,
          ]);
        }
      }
      return originalText;
    case "list":
      if (
        path.findAncestor((p) => p.type === "blockquote") &&
        options.proseWrap !== "always"
      ) {
        return originalText.replace(/\n>\s*$/, "");
      }
      return originalText;
    default:
      return originalText;
  }
}

export { printPrettierIgnored };
