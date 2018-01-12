#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

shell.config.fatal = true;

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");

// if (!fs.existsSync(distDir)) {
//   shell.exec("yarn build");
// }

const file = shell.exec("npm pack", { cwd: distDir }).stdout.trim();
const tarPath = path.join(distDir, file);
const tmpDir = tempy.directory();

shell.exec("npm init -y -s", { cwd: tmpDir });
shell.exec(`npm install "${tarPath}"`, { cwd: tmpDir });

const code = shell.exec("yarn test --color", {
  cwd: rootDir,
  env: Object.assign({}, process.env, {
    NODE_ENV: "production",
    PRETTIER_DIR: path.join(tmpDir, "node_modules/prettier")
  }),
  shell: true
}).code;

process.exit(code);
