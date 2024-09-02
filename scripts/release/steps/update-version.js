import { processFile, readJson, runYarn, writeJson } from "../utils.js";

export default async function updateVersion({ version, next }) {
  const pkg = await readJson("package.json");
  pkg.version = version;
  await writeJson("package.json", pkg);

  // For pre-release, just update package.json
  if (next) {
    return;
  }

  // Update github issue templates
  processFile(".github/ISSUE_TEMPLATE/formatting.md", (content) =>
    content.replace(/^(\*\*Prettier ).*?(\*\*)$/mu, `$1${version}$2`),
  );
  processFile(".github/ISSUE_TEMPLATE/integration.md", (content) =>
    content.replace(/^(- Prettier Version: ).*$/mu, `$1${version}`),
  );

  await runYarn(["install"], { cwd: "./website" });

  process.env.PRETTIER_VERSION = version;
  await runYarn(["update-stable-docs"], {
    cwd: "./website",
  });
}
