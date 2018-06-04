"use strict";

const chalk = require("chalk");
const dedent = require("dedent");
const fetch = require("node-fetch");
const clipboardy = require("clipboardy");
const { exec } = require("child-process-promise");
const { logPromise } = require("../utils");

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

module.exports = async function() {
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

  let instruction;
  try {
    clipboardy.writeSync(schema);
    instruction = "The new schema was copied to the clipboard.";
  } catch (err) {
    instruction =
      "In a new session, run `node scripts/generate-schema.js` and copy the output.";
  }

  console.log(
    dedent(chalk`
      {yellow.bold A manual step is necessary.}

      The schema in {yellow SchemaStore} needs an update.
      - ${instruction}
      - Go to {cyan.underline ${EDIT_URL}}
      - Fork, paste the new schema, and open a PR.
    `)
  );
};
