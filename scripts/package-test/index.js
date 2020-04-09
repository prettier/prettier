"use strict";

const os = require("os");
const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");
const { isCI } = require("ci-info");
const rootDir = path.join(__dirname, "..", "..");

module.exports = function (options) {
  shell.config.fatal = true;

  const TEMP_DIR = tempy.directory();

  const { dir } = options;
  const NODE_ENV = options.isProduction ? "production" : "";
  const PRETTIER_DIR = path.join(TEMP_DIR, "node_modules/prettier");

  const file = shell.exec("npm pack", { cwd: dir, silent: true }).stdout.trim();
  shell.mv(path.join(dir, file), TEMP_DIR);
  const tarPath = path.join(TEMP_DIR, file);

  shell.exec("npm init -y", { cwd: TEMP_DIR, silent: true });
  shell.exec(`npm install "${tarPath}" --engine-strict`, { cwd: TEMP_DIR });

  // This `maxWorkers` number is hard code for github actions
  const maxWorkers = isCI
    ? `--maxWorkers=${os.platform() === "darwin" ? 4 : 2}`
    : "";
  const testPath = process.env.TEST_STANDALONE ? "tests/" : "";
  const cmd = `yarn test --color ${maxWorkers} ${testPath}`;

  return shell.exec(cmd, {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV, AST_COMPARE: "1", PRETTIER_DIR },
    shell: true,
  }).code;
};
