"use strict";
const fs = require("fs/promises");
const semver = require("semver");
const minimist = require("minimist");
const pkg = require("../package.json");

const argv = minimist(process.argv.slice(2));
const filePath = argv._[0];
let { release } = argv;
if (!["major", "minor", "patch"].includes(release)) {
  release = "minor";
}

function formatVer(verString) {
  switch (release) {
    case "major":
    case "minor":
      return `${semver.major(verString)}.${semver.minor(verString)}`;
    case "patch":
      return verString;
  }
}

const stableVer = pkg.devDependencies.prettier;
const masterVer = semver.inc(stableVer, release);

(async () => {
  const data = await fs.readFile(filePath, "utf-8");

  const newData = data
    .split("\n")
    .map((line) => {
      const trimed = line.trim();
      const isComments =
        trimed.startsWith("// ") ||
        trimed.startsWith("# ") ||
        (trimed.startsWith("<!-- ") && trimed.endsWith(" -->")) ||
        (trimed.startsWith("/* ") && trimed.endsWith(" /*"))  ||
        (trimed.startsWith("{{!-- ") && trimed.endsWith(" --}}"));

      if (!isComments) {
        return line;
      }
      if (trimed.toLowerCase().includes("prettier stable")) {
        return line
          .toLowerCase()
          .replace("prettier stable", `Prettier ${formatVer(stableVer)}`);
      }
      if (trimed.toLowerCase().includes("prettier master")) {
        return line
          .toLowerCase()
          .replace("prettier master", `Prettier ${formatVer(masterVer)}`);
      }
      return line
    })
    .join("\n");

  await fs.writeFile(filePath, newData);
})();
