#!/usr/bin/env node

"use strict";

const path = require("path");
const pkg = require("../../package.json");
const formatMarkdown = require("../../website/static/markdown");
const shell = require("shelljs");

const rootDir = path.join(__dirname, "..", "..");

process.env.PATH += path.delimiter + path.join(rootDir, "node_modules", ".bin");

function pipe(string) {
  return new shell.ShellString(string);
}

shell.set("-e");
shell.cd(rootDir);

shell.rm("-Rf", "dist/");

shell.echo("Building externals...");
shell.exec("rollup -c scripts/build/rollup.externals.config.js");

shell.echo("Building internals...");
shell.exec("rollup -c scripts/build/rollup.internals.config.js");

// shell.exec("webpack --config scripts/build/webpack.config.js");

shell.echo("Update ISSUE_TEMPLATE.md");
const issueTemplate = shell.cat(".github/ISSUE_TEMPLATE.md").stdout;
const newIssueTemplate = issueTemplate.replace(
  /-->[^]*$/,
  "-->\n\n" +
    formatMarkdown(
      "// code snippet",
      "// code snippet",
      "",
      pkg.version,
      "https://prettier.io/playground/#.....",
      { parser: "babylon" },
      [["# Options (if any):", true], ["--single-quote", true]],
      true
    )
);
pipe(newIssueTemplate).to(".github/ISSUE_TEMPLATE.md");

shell.echo("Copy package.json");
const pkgWithoutDependencies = Object.assign({}, pkg);
delete pkgWithoutDependencies.dependencies;
pkgWithoutDependencies.scripts = {
  prepublishOnly:
    "node -e \"assert.equal(require('.').version, require('..').version)\""
};
pipe(JSON.stringify(pkgWithoutDependencies, null, 2)).to("dist/package.json");

shell.echo("Copy README.md");
shell.cp("README.md", "dist/README.md");

shell.echo("Done!");
shell.echo();
shell.echo("How to test against dist:");
shell.echo("  1) yarn test:dist");
shell.echo();
shell.echo("How to publish:");
shell.echo("  1) IMPORTANT!!! Go to dist/");
shell.echo("  2) npm publish");
