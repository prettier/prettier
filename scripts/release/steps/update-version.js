"use strict";

const execa = require("execa");
const { readFileSync, writeFileSync } = require("fs");
const { logPromise, readJson, writeJson } = require("../utils");

async function bump({ version }) {
  const pkg = await readJson("package.json");
  pkg.version = version;
  await writeJson("package.json", pkg, { spaces: 2 });

  // Update .github/ISSUE_TEMPLATE.MD
  const issueFile = ".github/ISSUE_TEMPLATE.md";
  const issueTempl = readFileSync(issueFile, "utf-8");
  writeFileSync(
    issueFile,
    issueTempl.replace(/^\*\*Prettier .*?\*\*$/m, `**Prettier ${version}**`)
  );
}

module.exports = async function(params) {
  await logPromise("Bumping version", bump(params));
  await logPromise(
    "Updating integration snapshots",
    execa("yarn", ["test-integration", "-u"])
  );
};
