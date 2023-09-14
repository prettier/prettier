import path from "node:path";
import editorconfig from "editorconfig";
const editorConfigToPrettier = require("./editorconfig-to-prettier.js");
import findProjectRoot from "./find-project-root.js";

async function loadEditorConfig(filePath) {
  const editorConfig = await editorconfig.parse(filePath, {
    root: findProjectRoot(path.dirname(path.resolve(filePath))),
  });

  const config = editorConfigToPrettier(editorConfig);

  if (config) {
    // We are not using this option
    delete config.insertFinalNewline;
  }

  return config;
}

export default loadEditorConfig;
