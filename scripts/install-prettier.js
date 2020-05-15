"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

shell.config.fatal = true;

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");

module.exports = () => {
  const file = shell.exec("npm pack", { cwd: distDir }).stdout.trim();
  const tarPath = path.join(distDir, file);
  const tmpDir = tempy.directory();

  shell.config.silent = true;
  shell.exec("npm init -y", { cwd: tmpDir });
  shell.exec(`npm install "${tarPath}"`, { cwd: tmpDir });
  shell.config.silent = false;

  return path.join(tmpDir, "node_modules/wp-prettier");
};
