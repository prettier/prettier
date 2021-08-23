import chalk from "chalk";
import outdent from "outdent";
import execa from "execa";
import { fetchText, logPromise } from "../utils.js";

const outdentString = outdent.string;

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

// Any optional or manual step can be warned in this script.

async function checkSchema() {
  const { stdout: schema } = await execa("node", [
    "scripts/generate-schema.mjs",
  ]);
  const remoteSchema = await logPromise(
    "Checking current schema in SchemaStore",
    fetchText(RAW_URL)
  );

  if (schema === remoteSchema.trim()) {
    return;
  }

  return outdentString(chalk`
    {bold.underline The schema in {yellow SchemaStore} needs an update.}
    - Open {cyan.underline ${EDIT_URL}}
    - Run {yellow node scripts/generate-schema.mjs} and copy the new schema
    - Paste it on GitHub interface
    - Open a PR
  `);
}

function twitterAnnouncement() {
  return outdentString(chalk`
    {bold.underline Announce on Twitter}
    - Open {cyan.underline https://tweetdeck.twitter.com}
    - Make sure you are tweeting from the {yellow @PrettierCode} account.
    - Tweet about the release, including the blog post URL.
  `);
}

export default async function () {
  const steps = [await checkSchema(), twitterAnnouncement()].filter(Boolean);

  console.log(chalk.bold.green("The script has finished!\n"));

  if (steps.length === 0) {
    return;
  }

  console.log(
    outdentString(chalk`
      {yellow.bold The following ${
        steps.length === 1 ? "step is" : "steps are"
      } optional.}

      ${steps.join("\n\n")}
    `)
  );
}
