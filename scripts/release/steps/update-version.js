"use strict";

const execa = require("execa");
const { logPromise, readJson, writeJson, processFile } = require("../utils");

async function bump({ version }) {
  const pkg = await readJson("package.json");
  pkg.version = version;
  await writeJson("package.json", pkg, { spaces: 2 });

  // Update github issue templates
  processFile(".github/ISSUE_TEMPLATE/formatting.md", (content) =>
    content.replace(
      /^(?<before>\*\*Prettier ).*?(?<after>\*\*)$/m,
      `$<before>${version}$<after>`
    )
  );
  processFile(".github/ISSUE_TEMPLATE/integration.md", (content) =>
    content.replace(
      /^(?<before>- Prettier Version: ).*?$/m,
      `$<before>${version}`
    )
  );
  processFile("docs/install.md", (content) =>
    content.replace(/^(?<before>npx prettier@)\S+/m, `$<before>${version}`)
  );

  // Update unpkg link in docs
  processFile("docs/browser.md", (content) =>
    content.replace(
      /(?<before>\/\/unpkg\.com\/prettier@).*?\//g,
      `$<before>${version}/`
    )
  );

  await execa("yarn", ["update-stable-docs"], {
    cwd: "./website",
  });
}

module.exports = async function (params) {
  await logPromise("Bumping version", bump(params));
};
