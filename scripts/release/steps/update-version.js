import { processFile,readJson, runYarn, writeJson } from "../utils.js";

export default async function updateVersion({ version }) {
  const pkg = await readJson("package.json");
  pkg.version = version;
  await writeJson("package.json", pkg);

  // Update github issue templates
  processFile(".github/ISSUE_TEMPLATE/formatting.md", (content) =>
    content.replace(/^(\*\*Prettier ).*?(\*\*)$/m, `$1${version}$2`),
  );
  processFile(".github/ISSUE_TEMPLATE/integration.md", (content) =>
    content.replace(/^(- Prettier Version: ).*$/m, `$1${version}`),
  );
  processFile("docs/install.md", (content) =>
    content.replace(/^(npx prettier@)\S+/m, `$1${version}`),
  );

  // Update unpkg link in docs
  processFile("docs/browser.md", (content) =>
    content.replaceAll(
      /(\/\/unpkg\.com\/(?:browse\/)?prettier@).*?\//g,
      `$1${version}/`,
    ),
  );

  await runYarn(["install"], { cwd: "./website" });

  await runYarn(["update-stable-docs"], {
    cwd: "./website",
  });
}
