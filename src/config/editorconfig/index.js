import path from "node:path";
import editorconfig from "editorconfig";
import {
  clearFindProjectRootCache,
  findProjectRoot,
} from "../find-project-root.js";
import editorConfigToPrettier from "./editorconfig-to-prettier.js";

const editorconfigCache = new Map();

function clearEditorconfigCache() {
  clearFindProjectRootCache();
  editorconfigCache.clear();
}

async function loadEditorconfigInternal(file, { shouldCache }) {
  const directory = path.dirname(file);
  const root = await findProjectRoot(directory, { shouldCache });
  const editorConfig = await editorconfig.parse(file, { root });
  const config = editorConfigToPrettier(editorConfig);
  return config;
}

/**
 * @param {string} file
 * @param {{shouldCache?: boolean}} options
 */
function loadEditorconfig(file, { shouldCache }) {
  file = path.resolve(file);

  if (!shouldCache || !editorconfigCache.has(file)) {
    // Even if `shouldCache` is false, we still cache the result, so we can use it when `shouldCache` is true
    editorconfigCache.set(
      file,
      loadEditorconfigInternal(file, { shouldCache }),
    );
  }

  return editorconfigCache.get(file);
}

export { clearEditorconfigCache, loadEditorconfig };
