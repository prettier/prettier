"use strict";

const cp = require("child_process");
const fs = require("fs");

const version = process.env.npm_package_version;

function processFile(filename, fn) {
  const content = fs.readFileSync(filename, "utf-8");
  fs.writeFileSync(filename, fn(content));
  cp.spawnSync("git", ["add", filename]);
}

// Update github issue templates
processFile(".github/ISSUE_TEMPLATE/formatting.md", content =>
  content.replace(/^(\*\*Prettier ).*?(\*\*)$/m, `$1${version}$2`)
);
processFile(".github/ISSUE_TEMPLATE/integration.md", content =>
  content.replace(/^(- Prettier Version: ).*?$/m, `$1${version}`)
);
