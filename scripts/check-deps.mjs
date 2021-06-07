import fs from "node:fs/promises";
import chalk from "chalk";

(async () => {
  const packageJson = JSON.parse(
    await fs.readFile(new URL("../package.json", import.meta.url))
  );

  validateDependencyObject(packageJson.dependencies);
  validateDependencyObject(packageJson.devDependencies);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function validateDependencyObject(object) {
  for (const key of Object.keys(object)) {
    if (object[key][0] === "^" || object[key][0] === "~") {
      console.error(
        chalk.red("error"),
        `Dependency "${chalk.bold.red(key)}" should be pinned.`
      );
      process.exitCode = 1;
    }
  }
}
