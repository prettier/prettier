"use strict";

const chalk = (x) => x;
chalk.supportsColor = false;
chalk.grey = chalk;
chalk.red = chalk;
chalk.bold = chalk;
chalk.yellow = chalk;
chalk.blue = chalk;
chalk.default = chalk;

module.exports = chalk;
