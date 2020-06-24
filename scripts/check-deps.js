"use strict";

const chalk = require("chalk");
const pkg = require("../package.json");

validateDependencyObject(pkg.dependencies);
validateDependencyObject(pkg.devDependencies);

function validateDependencyObject(object) {
  Object.keys(object).forEach((key) => {
    if (object[key][0] === "^" || object[key][0] === "~") {
      console.error(
        chalk.red("error"),
        `Dependency "${chalk.bold.red(key)}" should be pinned.`
      );
      process.exitCode = 1;
    }
  });
}
