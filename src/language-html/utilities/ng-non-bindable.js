import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const isElementWithNgNonBindable = (node) =>
  node?.kind === "element" && Object.hasOwn(node.attrMap, "ngNonBindable");

const angularNonBindableCache = new WeakMap();
const hasOrInNgNonBindableInternal = (node) =>
  Boolean(node) &&
  getOrInsertComputed(
    angularNonBindableCache,
    node,
    (node) =>
      isElementWithNgNonBindable(node) ||
      hasOrInNgNonBindableInternal(node.parent),
  );

const hasOrInNgNonBindable = (node, options) =>
  options.parser === "angular" && hasOrInNgNonBindableInternal(node);

export { hasOrInNgNonBindable };
