import fs from "node:fs/promises";
import styleText from "node-style-text";

const packageJson = JSON.parse(
  await fs.readFile(new URL("../package.json", import.meta.url)),
);

validateDependencyObject(packageJson.dependencies);
validateDependencyObject(packageJson.devDependencies);

function validateDependencyObject(object) {
  for (const [name, version] of Object.entries(object)) {
    if (version[0] === "^" || version[0] === "~") {
      console.error(
        styleText.bgRed.black(" ERROR "),
        `Dependency "${styleText.bold.blue(name)}" should be pinned.`,
      );
      process.exitCode = 1;
    }
  }
}
