import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const angularNonBindableCache = new WeakMap();
function hasOrInNgNonBindable(node) {
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

    return hasOrInNgNonBindable(node.parent);
  });
}

function isInNgNonBindable(path, options) {
  if (options.parser !== "angular") {
    return false;
  }

  return hasOrInNgNonBindable(path.node.parent);
}

export { isInNgNonBindable };
