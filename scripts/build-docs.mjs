#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import shell from "shelljs";
import globby from "globby";
import prettier from "prettier";
import createEsmUtils from "esm-utils";

shell.config.fatal = true;

const { __dirname, require } = createEsmUtils(import.meta);
const rootDir = path.join(__dirname, "..");
// [prettierx] website is now in x-unsupported/subdirectory
const docs = path.join(rootDir, "x-unsupported/website/static/lib");

function pipe(string) {
  return new shell.ShellString(string);
}

const isPullRequest = process.env.PULL_REQUEST === "true";
const prettierPath = path.join(
  rootDir,
  isPullRequest ? "dist" : "node_modules/prettier"
);

shell.mkdir("-p", docs);

if (isPullRequest) {
  // --- Build prettier for PR ---
  const pkg = require("../package.json");
  const newPkg = { ...pkg, version: `999.999.999-pr.${process.env.REVIEW_ID}` };
  pipe(JSON.stringify(newPkg, null, 2)).to("package.json");
  shell.exec("yarn build --playground");
  pipe(JSON.stringify(pkg, null, 2) + "\n").to("package.json"); // restore
}

shell.cp(`${prettierPath}/standalone.js`, `${docs}/`);
shell.cp(`${prettierPath}/parser-*.js`, `${docs}/`);

const parserModules = globby.sync(["parser-*.js"], { cwd: prettierPath });
const parsers = {};
for (const file of parserModules) {
  const plugin = require(path.join(prettierPath, file));
  const property = file.replace(/\.js$/, "").split("-")[1];
  parsers[file] = {
    parsers: Object.keys(plugin.parsers),
    property,
  };
}

fs.writeFileSync(
  `${docs}/parsers-location.js`,
  prettier.format(
    `
      "use strict";

      const parsersLocation = ${JSON.stringify(parsers)};
    `,
    { parser: "babel" }
  )
);

// --- Site ---
// [prettierx] website is now in x-unsupported/subdirectory
shell.cd("x-unsupported/website");
shell.echo("Building x-unsupported/website...");
shell.exec("yarn install");

shell.exec("yarn build");

shell.echo();
