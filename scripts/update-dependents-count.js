import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function fetchText(url) {
  const response = await fetch(url);
  assert.ok(response.ok, `Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function processFile(filename, transform) {
  const content = await fs.readFile(filename, "utf8");
  const newContent = transform(content);
  if (newContent !== content) {
    await fs.writeFile(filename, newContent);
  }
}

async function logPromise(name, promise) {
  process.stdout.write(`${name} ... `);
  try {
    const result = await promise;
    console.log("done");
    return result;
  } catch (error) {
    console.log("failed");
    assert.ifError(error);
  }
}

async function getNpmDependentsCount() {
  const npmPage = await logPromise(
    "Fetching npm dependents count",
    fetchText("https://www.npmjs.com/package/prettier"),
  );
  const dependentsCountNpm = Number(
    npmPage.match(/"dependentsCount":"(?<dependentsCount>\d+)",/).groups
      .dependentsCount,
  );
  assert.ok(
    !Number.isNaN(dependentsCountNpm),
    "Invalid data from https://www.npmjs.com/package/prettier",
  );

  return dependentsCountNpm;
}

async function getGithubDependentsCount() {
  const githubPage = await logPromise(
    "Fetching github dependents count",
    fetchText("https://github.com/prettier/prettier/network/dependents"),
  );
  const dependentsCountGithub = Number(
    githubPage
      .replaceAll("\n", "")
      .match(
        /<svg.*?octicon-code-square.*?>.*?<\/svg>\s*(?<dependentsCount>[\d,]+)\s*Repositories\s*<\/a>/,
      )
      .groups.dependentsCount.replaceAll(",", ""),
  );
  assert.ok(
    !Number.isNaN(dependentsCountGithub),
    "Invalid data from https://github.com/prettier/prettier/network/dependents",
  );

  return dependentsCountGithub;
}

async function update() {
  const [
    { value: dependentsCountNpm, reason: dependentsNpmError },
    { value: dependentsCountGithub, reason: dependentsGithubError },
  ] = await Promise.allSettled([
    getNpmDependentsCount(),
    getGithubDependentsCount(),
  ]);

  if (dependentsCountNpm || dependentsCountGithub) {
    await processFile(
      new URL("../website/src/pages/index.jsx", import.meta.url),
      (content) => {
        if (dependentsCountNpm) {
          content = content.replace(
            /(<strong data-placeholder="dependent-npm">)(.*?)(<\/strong>)/,
            `$1${formatNumber(dependentsCountNpm)}$3`,
          );
        }

        if (dependentsCountGithub) {
          content = content.replace(
            /(<strong data-placeholder="dependent-github">)(.*?)(<\/strong>)/,
            `$1${formatNumber(dependentsCountGithub)}$3`,
          );
        }

        return content;
      },
    );
  }

  assert.ifError(dependentsNpmError);
  assert.ifError(dependentsGithubError);
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

try {
  await update();
} catch (error) {
  console.error(error.message);
}
