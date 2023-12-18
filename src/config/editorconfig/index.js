import path from "node:path";

import editorconfig from "editorconfig";

import findProjectRootWithoutCache from "../find-project-root.js";
import editorConfigToPrettier from "./editorconfig-to-prettier.js";

const projectRootCache = new Map();
const editorconfigCache = new Map();

function clearEditorconfigCache() {
  projectRootCache.clear();
  editorconfigCache.clear();
}

function findProjectRoot(directory, { shouldCache }) {
  if (!shouldCache || !projectRootCache.has(directory)) {
    // Even if `shouldCache` is false, we still cache the result, so we can use it when `shouldCache` is true
    projectRootCache.set(directory, findProjectRootWithoutCache(directory));
  }
  return projectRootCache.get(directory);
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

  return file.get(file);
}

export { clearEditorconfigCache, loadEditorconfig };
