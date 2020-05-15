"use strict";

const execa = require("execa");
const got = require("got");
const humanFormat = require("human-format");
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
    (await got("https://www.npmjs.com/package/prettier")).body.match(
      /"dependentsCount":(\d+),/
    )[1]
  );
  const dependentsCountGithub = Number(
    (await got("https://github.com/prettier/prettier/network/dependents")).body
      .replace(/\n/g, "")
      .match(
        /<svg.*?octicon-gist.*?>.*?<\/svg>\s*([\d,]+?)\s*Repositories\s*<\/a>/
      )[1]
      .replace(/,/g, "")
  );
  processFile("website/pages/en/index.js", (content) =>
    content
      .replace(
        /(<strong data-name="dependent-npm">)(.*?)(<\/strong>)/,
        `$1${humanFormat(dependentsCountNpm)}$3`
      )
      .replace(
        /(<strong data-name="dependent-github">)(.*?)(<\/strong>)/,
        `$1${humanFormat(dependentsCountGithub)}$3`
      )
  );

  await execa("yarn", ["update-stable-docs"], {
    cwd: "./website",
  });
}

module.exports = async function (params) {
  await logPromise("Bumping version", bump(params));
};
