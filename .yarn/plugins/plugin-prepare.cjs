const fs = require("node:fs");
const path = require("node:path");

function setupVscode() {
  const settingsFile = path.join(__dirname, "../../.vscode/settings.json");

  const settingsExampleFile = path.join(
    __dirname,
    "../../.vscode/settings.example.json",
  );

  if (fs.existsSync(settingsFile) || !fs.existsSync(settingsExampleFile)) {
    return;
  }

  fs.copyFileSync(settingsExampleFile, settingsFile);
}

async function buildBabelCodeFrameForTest() {
  const { buildBabelCodeFrameForTest } =
    await import("../../scripts/build-babel-code-frame-for-test.js");

  await buildBabelCodeFrameForTest();
}

module.exports = {
  name: "plugin-prepare",
  factory: () => ({
    hooks: {
      async afterAllInstalled() {
        setupVscode();
        await buildBabelCodeFrameForTest();
      },
    },
  }),
};
