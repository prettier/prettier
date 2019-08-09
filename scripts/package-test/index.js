"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");
const rootDir = path.join(__dirname, "..", "..");

module.exports = function(options) {
  shell.config.fatal = true;

  const TEMP_DIR = tempy.directory();

  const dir = options.dir;
  const NODE_ENV = options.isProduction ? "production" : "";
  const PRETTIER_DIR = path.join(
    TEMP_DIR,
    "node_modules",
    "prettier",
    options.entryDir || ""
  );

  const file = shell.exec("npm pack", { cwd: dir, silent: true }).stdout.trim();
  const tarPath = path.join(dir, file);

  shell.exec("npm init -y", { cwd: TEMP_DIR, silent: true });

  try {
    shell.exec(`npm install "${tarPath}" --engine-strict`, { cwd: TEMP_DIR });
  }finally {
    shell.rm(tarPath);
  }

  const runInBand = process.env.CI ? "--runInBand" : "";
  const testPath = process.env.TEST_STANDALONE ? "tests/" : "";
  const cmd = `yarn test --color ${runInBand} ${testPath}`;

  return shell.exec(cmd, {
    cwd: rootDir,
    env: Object.assign({}, process.env, {
      NODE_ENV,
      AST_COMPARE: "1",
      PRETTIER_DIR
    }),
    shell: true
  }).code;
};
