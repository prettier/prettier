import editorconfig from "editorconfig";
import editorConfigToPrettier from "./editorconfig-to-prettier.js";

async function loadEditorConfig(filePath, stopDirectory) {
  const editorConfig = await editorconfig.parse(filePath, {
    root: stopDirectory,
  });

  const config = editorConfigToPrettier(editorConfig);

  return config;
}

export default loadEditorConfig;
