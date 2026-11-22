import { join } from "../../../document/index.js";
import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { maybeToLowerCase } from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";
import { printFeatureExpression } from "./feature-expression.js";
import { printMediaList } from "./query-list.js";

function printMediaQueryNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "media-query-list":
      return printMediaList(path, options, print);

    case "media-query":
      return [join(" ", path.map(print, "nodes")), path.isLast ? "" : ","];

    case "media-type":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-feature-expression":
      return printFeatureExpression(path, options, print);

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
