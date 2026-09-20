import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const angularNonBindableCache = new WeakMap();
function hasOrInNgNonBindableInternal(node) {
  return getOrInsertComputed(angularNonBindableCache, node, (node) => {
    if (
      node.kind === "element" &&
      Object.hasOwn(node.attrMap, "ngNonBindable")
    ) {
      return true;
    }

    if (!node.parent) {
      return false;
    }

    return hasOrInNgNonBindableInternal(node.parent);
  });
}

function hasOrInNgNonBindable(node, options) {
  if (options.parser !== "angular") {
    return false;
  }

  return hasOrInNgNonBindableInternal(node);
}

export { hasOrInNgNonBindable };
