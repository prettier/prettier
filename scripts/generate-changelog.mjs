#!/usr/bin/env node

/**
 * When you run the script, enter the number and category of the Pull Request at the prompt.
 * Get the PR title and author name via the GitHub API and create a file in ./changelog_unreleased
 *
 *   $ node ./scripts/generate-changelog.mjs
 *   ✔ Input your Pull Request number: · 10961
 *   ✔ Input category of your Pull Request: · typescript
 */

import fs from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";
import createEsmUtils from "esm-utils";
import enquirer from "enquirer";
import { CHANGELOG_CATEGORIES } from "./utils/changelog-categories.mjs";

const { __dirname } = createEsmUtils(import.meta);

const prNumberPrompt = new enquirer.NumberPrompt({
  message: "Input your Pull Request number:",
});
const prNumber = await prNumberPrompt.run();

const categoryPrompt = new enquirer.AutoComplete({
  message: "Input category of your Pull Request:",
  limit: CHANGELOG_CATEGORIES.length,
  // The array passed to `choices` will be broken, so copy it.
  choices: [...CHANGELOG_CATEGORIES],
});
const category = (await categoryPrompt.run()).trim();

if (!prNumber || !category) {
  throw new Error("Two args are required.");
}
assertCategory(category);

const { title, user } = await getPr(prNumber);

const newChangelog = await createChangelog(title, user, prNumber, category);

const changelogPath = await addNewChangelog(prNumber, category, newChangelog);

const relativePath = path.relative(path.join(__dirname, ".."), changelogPath);
console.log("Generated changelog file: " + relativePath);

/**
 * @param {number} prNumber
 * @returns {Promise<{ title: string; user: string }>}
 */
async function getPr(prNumber) {
  // https://docs.github.com/en/rest/reference/pulls#get-a-pull-request
  const url = `https://api.github.com/repos/prettier/prettier/pulls/${prNumber}`;
  const response = await fetch(url, {
    Headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Pull Request #${prNumber} not found.`);
    }
    throw new Error(response);
  }
  const { title, user } = await response.json();
  return {
    title,
    user: user.login,
  };
}

/**
 * @param {number} prNumber
 * @param {string} category
 * @param {string} newChangelog
 * @returns {Promise<string>}
 */
async function addNewChangelog(prNumber, category, newChangelog) {
  const newChangelogPath = path.resolve(
    __dirname,
    `../changelog_unreleased/${category}/${prNumber}.md`
  );
  await fs.writeFile(newChangelogPath, newChangelog);
  return newChangelogPath;
}

/**
 * @param {string} title
 * @param {string} user
 * @param {number} prNumber
 * @param {string} string
 * @returns {string}
 */
async function createChangelog(title, user, prNumber, category) {
  const changelogTemplatePath = path.resolve(
    __dirname,
    "../changelog_unreleased/TEMPLATE.md"
  );
  const changelogTemplate = await fs.readFile(changelogTemplatePath, "utf8");

  const titlePart = "Title";
  const prNumberPart = "#XXXX";
  const userPart = "@user";
  const codeBlockPart = "```jsx\n";
  const inputCommentPart = "// Input\n";
  const stableCommentPart = "// Prettier stable\n";
  const mainCommentPart = "// Prettier main\n";

  const syntax = getSyntaxFromCategory(category);

  return changelogTemplate
    .replace(titlePart, title)
    .replace(prNumberPart, `#${prNumber}`)
    .replace(userPart, `@${user}`)
    .replace(codeBlockPart, `\`\`\`${syntax}\n`)
    .replace(inputCommentPart, getCommentForSyntax(syntax, "Input") + "\n")
    .replace(
      stableCommentPart,
      getCommentForSyntax(syntax, "Prettier stable") + "\n"
    )
    .replace(
      mainCommentPart,
      getCommentForSyntax(syntax, "Prettier main") + "\n"
    );
}

/**
 * @param {string} category
 * @returns {string}
 */
function getSyntaxFromCategory(category) {
  switch (category) {
    case "angular":
    case "html":
    case "lwc":
      return "html";
    case "cli":
      return "sh";
    case "graphql":
      return "gql";
    case "handlebars":
      return "hbs";
    case "json":
      return "jsonc";
    case "markdown":
      return "md";
    case "mdx":
      return "mdx";
    case "flow":
    case "javascript":
    case "api":
      return "jsx";
    case "typescript":
      return "tsx";
    case "css":
    case "scss":
    case "less":
      return "css";
    default:
      return category;
  }
}

/**
 * @param {string} syntax
 * @param {string} comment
 * @returns {string}
 */
function getCommentForSyntax(syntax, comment) {
  switch (syntax) {
    case "md":
    case "mdx":
    case "html":
      return `<!-- ${comment} -->`;
    case "sh":
    case "gql":
      return `# ${comment}`;
    case "hbs":
      return `{{! ${comment} }}`;
    case "css":
      return `/* ${comment} */`;
    default:
      return `// ${comment}`;
  }
}

/**
 * @param {unknown}
 * @returns {void}
 */
function assertCategory(category) {
  if (!CHANGELOG_CATEGORIES.includes(category)) {
    throw new Error(`${category} is invalid category`);
  }
}
