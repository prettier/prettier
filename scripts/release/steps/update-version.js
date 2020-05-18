"use strict";

const execa = require("execa");
const fetch = require("node-fetch");
const { logPromise, readJson, writeJson, processFile } = require("../utils");

async function bump({ version }) {
  const pkg = await readJson("package.json");
  pkg.version = version;
  await writeJson("package.json", pkg, { spaces: 2 });

  // Update github issue templates
  processFile(".github/ISSUE_TEMPLATE/formatting.md", (content) =>
    content.replace(/^(\*\*Prettier ).*?(\*\*)$/m, `$1${version}$2`)
  );
  processFile(".github/ISSUE_TEMPLATE/integration.md", (content) =>
    content.replace(/^(- Prettier Version: ).*?$/m, `$1${version}`)
  );
  processFile("docs/install.md", (content) =>
    content.replace(/^(npx prettier@)\S+/m, `$1${version}`)
  );

  // Update unpkg link in docs
  processFile("docs/browser.md", (content) =>
    content.replace(/(\/\/unpkg\.com\/prettier@).*?\//g, `$1${version}/`)
  );

  // Update dependents count
  const dependentsCountNpm = Number(
    (
      await (await fetch("https://www.npmjs.com/package/prettier")).text()
    ).match(/"dependentsCount":(\d+),/)[1]
  );
  const dependentsCountGithub = Number(
    (
      await (
        await fetch("https://github.com/prettier/prettier/network/dependents")
      ).text()
    )
      .replace(/\n/g, "")
      .match(
        /<svg.*?octicon-gist.*?>.*?<\/svg>\s*([\d,]+?)\s*Repositories\s*<\/a>/
      )[1]
      .replace(/,/g, "")
  );
  processFile("website/pages/en/index.js", (content) =>
    content
      .replace(
        /(<strong data-placeholder="dependent-npm">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountNpm)}$3`
      )
      .replace(
        /(<strong data-placeholder="dependent-github">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountGithub)}$3`
      )
  );

  await execa("yarn", ["update-stable-docs"], {
    cwd: "./website",
  });
}

function formatNumber(value) {
  if (value < 1e4) {
    return String(value).slice(0, 1) + "0".repeat(String(value).length - 1);
  } else if (value < 1e6) {
    return Math.floor(value / 1e2) / 10 + "k";
  }
  return Math.floor(value / 1e5) / 10 + "m";
}

module.exports = async function (params) {
  await logPromise("Bumping version", bump(params));
};
