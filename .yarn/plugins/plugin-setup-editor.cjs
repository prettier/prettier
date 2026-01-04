const fs = require("node:fs");
const path = require("node:path");

const vscodeDirectory = path.join(__dirname, "../../.vscode/");

function copyFile(from, to) {
  const source = path.join(vscodeDirectory, from);
  const target = path.join(vscodeDirectory, to);

  if (fs.existsSync(target) || !fs.existsSync(source)) {
    return;
  }

  fs.copyFileSync(source, target);
}

module.exports = {
  name: "plugin-setup-editor",
  factory: () => ({
    hooks: {
      afterAllInstalled() {
        copyFile("settings.example.json", "settings.json");
        copyFile("mcp.example.json", "mcp.json");
      },
    },
  }),
};
