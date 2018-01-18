#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const parsers = require("./parsers");

const rootDir = path.join(__dirname, "..", "..");
const docs = path.join(rootDir, "website/static/lib");

const stripLanguageDirectory = parserPath => parserPath.replace(/.*\//, "");

function pipe(string) {
  return new shell.ShellString(string);
}

const isPullRequest = process.env.PULL_REQUEST === "true";
const prettierPath = isPullRequest ? "dist" : "node_modules/prettier/";

const parserPaths = parsers.map(stripLanguageDirectory);

// --- Build prettier for PR ---

if (isPullRequest) {
  const pkg = require("../../package.json");
  pkg.version = `999.999.999-pr.${process.env.REVIEW_ID}`;
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

// wrap content with IIFE to avoid `assign to readonly` error on Safari
(function(filename) {
  const content = fs.readFileSync(filename, "utf8");
  const wrapped = `"use strict";(function(){${content}}());`;
  fs.writeFileSync(filename, wrapped);
})(`${docs}/index.js`);

shell.exec(
  `rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-babylon.js -i ${prettierPath}/parser-babylon.js`
);
shell.exec(
  `node_modules/babel-cli/bin/babel.js ${docs}/parser-babylon.js --out-file ${docs}/parser-babylon.js --presets=es2015`
);

for (const parser of parserPaths) {
  if (parser.endsWith("babylon")) {
    continue;
  }
  shell.exec(
    `rollup -c scripts/build/rollup.docs.config.js --environment filepath:${parser}.js -i ${prettierPath}/${parser}.js`
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
