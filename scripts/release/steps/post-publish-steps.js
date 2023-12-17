import chalk from "chalk";
import { execa } from "execa";
import outdent from "outdent";

import { fetchText, logPromise } from "../utils.js";

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

// Any optional or manual step can be warned in this script.

async function checkSchema() {
  const { stdout: schema } = await execa("node", [
    "scripts/generate-schema.js",
  ]);
  const remoteSchema = await logPromise(
    "Checking current schema in SchemaStore",
    fetchText(RAW_URL),
  );

  if (schema === remoteSchema.trim()) {
    return;
  }

  return outdent`
    ${chalk.bold.underline(
      "The schema in {yellow SchemaStore",
    )} needs an update.}
    - Open ${chalk.cyan.underline(EDIT_URL)}
    - Run ${chalk.yellow(
      "node scripts/generate-schema.mjs",
    )} and copy the new schema
    - Paste it on GitHub interface
    - Open a PR
  `;
}

function twitterAnnouncement() {
  return outdent`
    ${chalk.bold.underline("Announce on Twitter")}
    - Open ${chalk.cyan.underline("https://tweetdeck.twitter.com")}
    - Make sure you are tweeting from the {yellow @PrettierCode} account.
    - Tweet about the release, including the blog post URL.
  `;
}

export default async function postPublishSteps({ dry }) {
  console.log(chalk.bold.green("The script has finished!\n"));

  if (dry) {
    return;
  }

  const steps = [await checkSchema(), twitterAnnouncement()].filter(Boolean);

  console.log(
    outdent`
      ${chalk.yellow.bold(
        `The following ${
          steps.length === 1 ? "step is" : "steps are"
        } optional.`,
      )}

      ${steps.join("\n\n")}
    `,
  );
}
