#!/usr/bin/env node

"use strict";

const path = require("path");
const pkg = require("../../package.json");
const formatMarkdown = require("../../website/static/markdown");
const parsers = require("./parsers");
const shell = require("shelljs");

const rootDir = path.join(__dirname, "..", "..");

process.env.PATH += path.delimiter + path.join(rootDir, "node_modules", ".bin");

function pipe(string) {
  return new shell.ShellString(string);
}

shell.set("-e");
shell.cd(rootDir);

shell.rm("-Rf", "dist/");

// --- Lib ---

shell.exec("rollup -c scripts/build/rollup.index.config.js");

shell.exec("rollup -c scripts/build/rollup.bin.config.js");
shell.chmod("+x", "./dist/bin-prettier.js");

shell.exec("rollup -c scripts/build/rollup.third-party.config.js");

for (const parser of parsers) {
  if (parser.endsWith("postcss")) {
    continue;
  }
  shell.exec(
    `rollup -c scripts/build/rollup.parser.config.js --environment parser:${parser}`
  );
  if (parser.endsWith("glimmer")) {
    shell.exec(
      `node_modules/babel-cli/bin/babel.js dist/parser-glimmer.js --out-file dist/parser-glimmer.js --presets=es2015`
    );
  }
}

shell.echo("\nsrc/language-css/parser-postcss.js → dist/parser-postcss.js");
// PostCSS has dependency cycles and won't work correctly with rollup :(
shell.exec(
  "webpack --hide-modules src/language-css/parser-postcss.js dist/parser-postcss.js"
);
// Prepend module.exports =
const content = shell.cat("dist/parser-postcss.js").stdout;
pipe(`module.exports = ${content}`).to("dist/parser-postcss.js");

shell.echo();

// --- Misc ---

shell.echo("Remove eval");
shell.sed(
  "-i",
  /eval\("require"\)/,
  "require",
  "dist/index.js",
  "dist/bin-prettier.js"
);

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
pkgWithoutDependencies.bin = "./bin-prettier.js";
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
