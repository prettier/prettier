import {
  group,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locStart } from "../loc.js";
import { isVoidElement } from "../utilities.js";

/* ElementNode print helpers */

function sortByLoc(a, b) {
  return locStart(a) - locStart(b);
}

function printStartingTag(path, options, print) {
  const { node } = path;

  const types = ["attributes", "modifiers", "comments"].filter((property) =>
    isNonEmptyArray(node[property]),
  );
  const attributes = types.flatMap((type) => node[type]).sort(sortByLoc);

  for (const attributeType of types) {
    path.each(({ node }) => {
      const index = attributes.indexOf(node);
      attributes[index] = [line, print()];
    }, attributeType);
  }

  if (isNonEmptyArray(node.blockParams)) {
    attributes.push(line, printBlockParams(node));
  }

  return [
    options.htmlWhitespaceSensitivity === "ignore" &&
    path.previous?.type === "ElementNode"
      ? softline
      : "",
    group(["<", node.tag, indent(attributes), printStartingTagEndMarker(node)]),
  ];
}

function printStartingTagEndMarker(node) {
  if (isVoidElement(node)) {
    return ifBreak([softline, "/>"], [" />", softline]);
  }

  return ifBreak([softline, ">"], ">");
}

function printBlockParams(node) {
  return ["as |", node.blockParams.join(" "), "|"];
}

export { printBlockParams, printStartingTag };
