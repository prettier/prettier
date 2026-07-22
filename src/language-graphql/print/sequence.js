import { hardline } from "../../document/index.js";
import isNextLineEmpty from "../../utilities/is-next-line-empty.js";
import { locEnd } from "../loc.js";

function printSequence(path, options, print, property) {
  return path.map(({ isLast, node }) => {
    const printed = print();

    if (!isLast && isNextLineEmpty(options.originalText, locEnd(node))) {
      return [printed, hardline];
    }

    return printed;
  }, property);
}

export { printSequence };
