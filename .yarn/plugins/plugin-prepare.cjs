const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../../");

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
      async afterAllInstalled({ cwd: rawCwd }) {
        console.log(`Yarn plugin "prepare" running in "${rawCwd}".`);

        let cwd = rawCwd;

        if (process.platform === "win32" && cwd.startsWith("/")) {
          cwd = cwd.slice(1);
        }

        if (path.join(cwd, "./") !== root) {
          console.log(
            `Yarn plugin "prepare" skipped, yarn command not running in "${root}".`,
          );
          return;
        }

        setupVscode();
        try {
          await buildBabelCodeFrameForTest();
        } catch {}
      },
    },
  }),
};
