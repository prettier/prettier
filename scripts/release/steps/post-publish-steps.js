import styleText from "node-style-text";
import outdent from "outdent";
import { fetchText, logPromise, writeFile } from "../utils.js";

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

// Any optional or manual step can be warned in this script.

async function checkSchema() {
  const { generateSchema } = await import("../../utils/generate-schema.js");
  const schema = await generateSchema();
  const remoteSchema = await logPromise(
    "Checking current schema in SchemaStore",
    fetchText(RAW_URL),
  );

  if (schema.trim() === remoteSchema.trim()) {
    return;
  }

  writeFile(
    new URL("../../../.tmp/schema/prettierrc.json", import.meta.url),
    schema,
  );

  return outdent`
    ${styleText.bold.underline(
      "The schema in {yellow SchemaStore",
    )} needs an update.}
    - Open ${styleText.cyan.underline(EDIT_URL)}
    - Open ${styleText.cyan.underline("/.tmp/schema/prettierrc.json")} file and copy the content
    - Paste it on GitHub interface
    - Open a PR
  `;
}

function twitterAnnouncement() {
  return outdent`
    ${styleText.bold.underline("Announce on Twitter")}
    - Open ${styleText.cyan.underline("https://tweetdeck.twitter.com")}
    - Make sure you are tweeting from the ${styleText.yellow("@PrettierCode")} account.
    - Tweet about the release, including the blog post URL.
  `;
}

export default async function postPublishSteps({ dry, next }) {
  console.log(styleText.bold.green("The script has finished!\n"));

  if (dry || next) {
    return;
  }

  const steps = [await checkSchema(), twitterAnnouncement()].filter(Boolean);

  console.log(
    outdent`
      ${styleText.yellow.bold(
        `The following ${
          steps.length === 1 ? "step is" : "steps are"
        } optional.`,
      )}

      ${steps.join("\n\n")}
    `,
  );
}
