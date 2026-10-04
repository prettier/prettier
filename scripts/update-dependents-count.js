import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function fetchText(url) {
  const response = await fetch(url);
  assert.ok(response.ok, `Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function getNpmDependentsCount() {
  const npmPage = await fetchText("https://www.npmjs.com/package/prettier");
  const matches = npmPage.match(/"dependentsCount":"(?<dependentsCount>\d+)",/);

  assert.ok(
    matches,
    "Invalid data from https://www.npmjs.com/package/prettier",
  );

  const dependentsCountNpm = Number(matches.groups.dependentsCount);
  assert.ok(
    !Number.isNaN(dependentsCountNpm),
    "Invalid data from https://www.npmjs.com/package/prettier",
  );

  return dependentsCountNpm;
}

async function getGithubDependentsCount() {
  const githubPage = await fetchText(
    "https://github.com/prettier/prettier/network/dependents",
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

  const file = new URL("../website/src/pages/index.jsx", import.meta.url);
  const original = await fs.readFile(file, "utf8");

  let content = original;
  for (const { name, error, value, update } of [
    {
      name: "NPM dependents count",
      error: dependentsNpmError,
      value: dependentsCountNpm,
      update: (text, value) =>
        text.replace(
          /(?<=<strong data-placeholder="dependent-npm">).*?(?=<\/strong>)/,
          formatNumber(value),
        ),
    },
    {
      name: "GitHub dependents count",
      error: dependentsGithubError,
      value: dependentsCountGithub,
      update: (text, value) =>
        text.replace(
          /(?<=<strong data-placeholder="dependent-github">).*?(?=<\/strong>)/,
          formatNumber(value),
        ),
    },
  ]) {
    if (error) {
      console.log(`❌ Failed to update ${name}.`);
    } else {
      console.log(`✅ ${name} updated.`);
      content = update(content, value);
    }
  }

  if (original !== content) {
    await fs.writeFile(file, content);
  }

  if (dependentsNpmError) {
    console.log();
    console.error(dependentsNpmError);
  }

  if (dependentsGithubError) {
    console.log();
    console.error(dependentsGithubError);
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

await update();
