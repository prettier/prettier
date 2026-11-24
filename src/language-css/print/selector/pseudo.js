import {
  group,
  indent,
  join,
  line,
  softline,
} from "../../../document/index.js";
import isNonEmptyArray from "../../../utilities/is-non-empty-array.js";
import { maybeToLowerCase } from "../../utilities/index.js";

function printPseudoSelector(path, options, print) {
  const { node } = path;

  return [
    maybeToLowerCase(node.value),
    isNonEmptyArray(node.nodes)
      ? group([
          "(",
          indent([softline, join([",", line], path.map(print, "nodes"))]),
          softline,
          ")",
        ])
      : "",
  ];
}

export { printPseudoSelector };
