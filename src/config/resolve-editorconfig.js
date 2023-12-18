import path from "node:path";

import editorconfig from "editorconfig";

import editorConfigToPrettier from "./editorconfig-to-prettier.js";
import findProjectRoot from "./find-project-root.js";

async function loadEditorConfig(filePath) {
  const editorConfig = await editorconfig.parse(filePath, {
    root: await findProjectRoot(path.dirname(path.resolve(filePath))),
  });

  const config = editorConfigToPrettier(editorConfig);

  return config;
}

export default loadEditorConfig;
