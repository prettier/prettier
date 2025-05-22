const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  name: "plugin-setup-editor",
  factory: () => ({
    hooks: {
      afterAllInstalled() {
        const settingsFile = path.join(
          __dirname,
          "../../.vscode/settings.json",
        );

        const settingsExampleFile = path.join(
          __dirname,
          "../../.vscode/settings.example.json",
        );

        if (
          fs.existsSync(settingsFile) ||
          !fs.existsSync(settingsExampleFile)
        ) {
          return;
        }

        fs.copyFileSync(settingsExampleFile, settingsFile);
      },
    },
  }),
};
