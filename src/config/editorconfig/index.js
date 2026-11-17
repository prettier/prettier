import path from "node:path";
import { parse as parseEditorconfig } from "editorconfig-without-wasm";
import {
  clearFindProjectRootCache,
  findProjectRoot,
} from "../find-project-root.js";
import editorConfigToPrettier from "./editorconfig-to-prettier.js";

/**
@typedef {ReturnType<editorConfigToPrettier>} EditorConfig
*/

/**
@type {Map<string, Promise<EditorConfig>>}
*/
const editorconfigCache = new Map();

/**
Parsed `.editorconfig` files, shared across all files that look them up.
@type {Map<string, any>}
*/
const editorconfigFileCache = new Map();

function clearEditorconfigCache() {
  clearFindProjectRootCache();
  editorconfigCache.clear();
  editorconfigFileCache.clear();
}

async function loadEditorconfigInternal(file, { shouldCache }) {
  const directory = path.dirname(file);
  const root = await findProjectRoot(directory, { shouldCache });
  // Even if `shouldCache` is false, we still cache the parsed files, so we can use them when `shouldCache` is true
  const cache = shouldCache
    ? editorconfigFileCache
    : {
        get: () => undefined,
        set(name, config) {
          editorconfigFileCache.set(name, config);
          return this;
        },
      };
  const editorConfig = await parseEditorconfig(file, { cache, root });
  const config = editorConfigToPrettier(editorConfig);
  return config;
}

/**
@param {string} file
@param {{shouldCache?: boolean}} options
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
