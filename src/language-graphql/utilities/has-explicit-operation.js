import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { locStart } from "../loc.js";

const cache = new WeakMap();
const hasExplicitOperation = (node, options) =>
  getOrInsertComputed(
    cache,
    node,
    (node) => options.originalText[locStart(node)] !== "{",
  );

export { hasExplicitOperation };
