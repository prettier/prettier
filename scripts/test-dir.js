"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

module.exports = function({ dir, isProduction, prettierDir }) {
  shell.config.fatal = true;

  const rootDir = path.join(__dirname, "..");

  const file = shell.exec("npm pack", { cwd: dir }).stdout.trim();
  const tarPath = path.join(dir, file);
  const tmpDir = tempy.directory();

  // shell.config.silent = true;
  shell.exec("npm init -y", { cwd: tmpDir });
  shell.exec(`npm install "${tarPath}"`, { cwd: tmpDir });
  shell.rm(tarPath);
  // shell.config.silent = false;

  const runInBand = process.env.CI ? "--runInBand" : "";
  const testPath = process.env.TEST_STANDALONE ? "tests/" : "";
  const cmd = `yarn test --color ${runInBand} ${testPath}`;

  return shell.exec(cmd, {
    cwd: rootDir,
    env: Object.assign({}, process.env, {
      NODE_ENV: isProduction ? "production" : "",
      AST_COMPARE: "1",
      PRETTIER_DIR: path.join(tmpDir, "node_modules/prettier", prettierDir)
    }),
    shell: true
  }).code;
};
