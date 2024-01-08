import fs from "node:fs";
import { copyFile } from "./utils/index.js";

console.log(import.meta.url);

await setupEditor();

function setupEditor() {
  const vscodeSettingsFile = new URL(
    "../.vscode/settings.json",
    import.meta.url,
  );
  if (fs.existsSync(vscodeSettingsFile)) {
    return;
  }

  return copyFile(
    new URL("./settings.example.json", vscodeSettingsFile),
    vscodeSettingsFile,
  );
}
