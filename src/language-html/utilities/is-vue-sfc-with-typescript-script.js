import { isVueScriptTag } from "./index.js";

const cache = new WeakMap();
function isVueSfcWithTypescriptScript(path, options) {
  const { root } = path;
  if (!cache.has(root)) {
    cache.set(
      root,
      root.children.some(
        (child) =>
          isVueScriptTag(child, options) &&
          ["ts", "typescript"].includes(child.attrMap.lang),
      ),
    );
  }

  return cache.get(root);
}

export default isVueSfcWithTypescriptScript;
