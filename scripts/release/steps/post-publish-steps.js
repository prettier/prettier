"use strict";

const chalk = require("chalk");
const dedent = require("dedent");
const fetch = require("node-fetch");
const clipboardy = require("clipboardy");
const { exec } = require("child-process-promise");
const { logPromise, waitForEnter } = require("../utils");

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

// Any optional or manual step can be warned in this script.

async function checkSchema() {
  const schema = (await exec("node scripts/generate-schema.js")).stdout.trim();
  const remoteSchema = await logPromise(
    "Checking current schema in SchemaStore",
    fetch(RAW_URL)
      .then(r => r.text())
      .then(t => t.trim())
  );

  if (schema === remoteSchema) {
    return;
  }

  return chalk`
    {bold.underline The schema in {yellow SchemaStore} needs an update.}
    - Open {cyan.underline ${EDIT_URL}}
    - Run {yellow node scripts/generate-schema.js} and copy the new schema
    - Paste it on GitHub interface
    - Open a PR
  `;
}

module.exports = async function() {
  let steps = [];
  steps.push(await checkSchema());
  steps.push(chalk`
    {bold.underline Announce on Twitter}
    - Open {cyan.underline https://tweetdeck.twitter.com}
    - From the {yellow @PrettierCode} account, tweet about the release.
  `);

  steps = steps.filter(Boolean);
  console.log(
    chalk.yellow.bold(
      steps.length === 1
        ? "A manual step is necessary"
        : "Some manual steps are necessary\n"
    )
  );

  console.log(steps.map(step => dedent(step)).join("\n\n"));
};
