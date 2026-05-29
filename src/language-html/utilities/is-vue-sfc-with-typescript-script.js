import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { isVueScriptTag } from "./index.js";

const cache = new WeakMap();
function isVueSfcWithTypescriptScript(path, options) {
  return getOrInsertComputed(cache, path.root, (root) =>
    root.children.some(
      (child) =>
        isVueScriptTag(child, options) &&
        ["ts", "typescript"].includes(child.attrMap.lang),
    ),
  );
}

export default isVueSfcWithTypescriptScript;
