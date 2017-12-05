#!/usr/bin/env node

"use strict";

const path = require("path");
const shell = require("shelljs");

const rootDir = path.join(__dirname, "..", "..");
const docs = path.join(rootDir, "website/static/lib");
const parsers = [
  "babylon",
  "flow",
  "typescript",
  "graphql",
  "postcss",
  "parse5",
  "markdown"
];

function pipe(string) {
  return new shell.ShellString(string);
}

const isPullRequest = process.env.PULL_REQUEST === "true";
const prettierPath = isPullRequest ? "dist" : "node_modules/prettier/";

// --- Build prettier for PR ---

if (isPullRequest) {
  const pkg = require("../../package.json");
  pkg.version = `pr-${process.env.REVIEW_ID}`;
  pipe(JSON.stringify(pkg, null, 2)).to("package.json");
  shell.exec("node scripts/build/build.js");
}

// --- Docs ---

shell.mkdir("-p", docs);

shell.echo("Bundling docs index...");
shell.cp(`${prettierPath}/index.js`, `${docs}/index.js`);
shell.exec(
  `node_modules/babel-cli/bin/babel.js ${docs}/index.js --out-file ${docs}/index.js --presets=es2015`
);

shell.echo("Bundling docs babylon...");
shell.exec(
  `rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-babylon.js -i ${prettierPath}/parser-babylon.js`
);
shell.exec(
  `node_modules/babel-cli/bin/babel.js ${docs}/parser-babylon.js --out-file ${docs}/parser-babylon.js --presets=es2015`
);

for (const parser of parsers) {
  if (parser === "babylon") {
    continue;
  }
  shell.echo(`Bundling docs ${parser}...`);
  shell.exec(
    `rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-${parser}.js -i ${prettierPath}/parser-${parser}.js`
  );
}

shell.echo("Copy sw-toolbox.js to docs");
shell.cp("node_modules/sw-toolbox/sw-toolbox.js", `${docs}/sw-toolbox.js`);

// --- Site ---
shell.cd("website");
shell.echo("Building website...");
shell.exec("yarn install");
shell.exec("yarn build");

shell.echo();
