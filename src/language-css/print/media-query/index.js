import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { group, indent, join, line } from "../document/index.js";
import { adjustNumbers, adjustStrings } from "./print/misc.js";
import { maybeToLowerCase } from "./utilities/index.js";

function printMediaQueryNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "media-query-list": {
      const parts = [];
      path.each(({ node }) => {
        if (node.type === "media-query" && node.value === "") {
          return;
        }
        parts.push(print());
      }, "nodes");

      return group(indent(join(line, parts)));
    }
    case "media-query":
      return [join(" ", path.map(print, "nodes")), path.isLast ? "" : ","];

    case "media-type":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-feature-expression":
      if (!node.nodes) {
        return node.value;
      }
      return ["(", ...path.map(print, "nodes"), ")"];

    case "media-feature":
      return maybeToLowerCase(
        adjustStrings(node.value.replaceAll(/ +/g, " "), options),
      );

    case "media-colon":
      return [node.value, " "];

    case "media-value":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-keyword":
      return adjustStrings(node.value, options);

    case "media-url":
      return adjustStrings(
        node.value.replaceAll(/^url\(\s+/gi, "url(").replaceAll(/\s+\)$/g, ")"),
        options,
      );

    case "media-unknown":
      return node.value;

    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Media query");
  }
}

export { printMediaQueryNode };
