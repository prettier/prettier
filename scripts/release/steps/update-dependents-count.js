import styleText from "node-style-text";
import { fetchText, logPromise, processFile, runGit } from "../utils.js";

async function update() {
  const npmPage = await logPromise(
    "Fetching npm dependents count",
    fetchText("https://www.npmjs.com/package/prettier"),
  );
  const dependentsCountNpm = Number(
    npmPage.match(/"dependentsCount":(\d+),/u)[1],
  );
  if (Number.isNaN(dependentsCountNpm)) {
    throw new TypeError(
      "Invalid data from https://www.npmjs.com/package/prettier",
    );
  }

  const githubPage = await logPromise(
    "Fetching github dependents count",
    fetchText("https://github.com/prettier/prettier/network/dependents"),
  );
  const dependentsCountGithub = Number(
    githubPage
      .replaceAll("\n", "")
      .match(
        /<svg.*?octicon-code-square.*?>.*?<\/svg>\s*([\d,]+)\s*Repositories\s*<\/a>/u,
      )[1]
      .replaceAll(",", ""),
  );
  if (Number.isNaN(dependentsCountNpm)) {
    throw new TypeError(
      "Invalid data from https://github.com/prettier/prettier/network/dependents",
    );
  }

  processFile("website/pages/en/index.js", (content) =>
    content
      .replace(
        /(<strong data-placeholder="dependent-npm">)(.*?)(<\/strong>)/u,
        `$1${formatNumber(dependentsCountNpm)}$3`,
      )
      .replace(
        /(<strong data-placeholder="dependent-github">)(.*?)(<\/strong>)/u,
        `$1${formatNumber(dependentsCountGithub)}$3`,
      ),
  );

  const isUpdated = await logPromise(
    "Checking if dependents count has been updated",
    async () =>
      (await runGit(["diff", "--name-only"])).stdout ===
      "website/pages/en/index.js",
  );

  if (isUpdated) {
    await logPromise("Committing and pushing to remote", async () => {
      await runGit(["add", "."]);
      await runGit(["commit", "-m", "Update dependents count"]);
      await runGit(["push"]);
    });
  }
}

function formatNumber(value) {
  if (value < 1e4) {
    return String(value).slice(0, 1) + "0".repeat(String(value).length - 1);
  }
  if (value < 1e6) {
    return Math.floor(value / 1e2) / 10 + "k";
  }
  return Math.floor(value / 1e5) / 10 + " million";
}

export default async function updateDependentsCount({ dry, next }) {
  if (dry || next) {
    return;
  }

  try {
    await update();
  } catch (error) {
    console.log(styleText.red.bold(error.message));
  }
}
