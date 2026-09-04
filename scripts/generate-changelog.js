#!/usr/bin/env node

/**
 * When you run the script, enter the number and category of the Pull Request at the prompt.
 * Get the PR title and author name via the GitHub API and create a file in ./changelog_unreleased
 *
 *   $ node ./scripts/generate-changelog.js
 *   ✔ Input your Pull Request number: 10961
 *   ✔ Input category of your Pull Request: typescript
 */

import fs from "node:fs/promises";
import * as prompts from "@clack/prompts";
import openEditor from "open-editor";
import { categories } from "./utilities/changelog.js";

async function generateChangelog() {
  let prNumber = await prompts.text({
    message: "Pull request number:",
    initialValue: "",
    validate(value) {
      value = value.trim();

      if (!value) {
        return "Pull request number is required.";
      }

      if (!/^\d{4,}$/.test(value)) {
        return "Invalid pull request number.";
      }
    },
    withGuide: false,
  });

  if (prompts.isCancel(prNumber)) {
    return;
  }

  const category = await prompts.autocomplete({
    message: "Category:",
    options: categories.map((category) => ({
      value: category.dir,
      label: category.title,
    })),
    withGuide: false,
  });

  if (prompts.isCancel(category)) {
    return;
  }

  prNumber = prNumber.trim();

  const { title, user } = await getPr(prNumber);

  const content = await createChangelog(title, user, prNumber, category);

  const file = await addNewChangelog(prNumber, category, content);

  const relativePath = file.href.slice(
    new URL("../", import.meta.url).href.length,
  );

  console.log("Generated changelog file: " + relativePath);

  const shouldOpenChangelog = await prompts.confirm({
    message: "Open changelog file?",
    initialValue: true,
    vertical: true,
    withGuide: false,
  });

  if (prompts.isCancel(shouldOpenChangelog) || !shouldOpenChangelog) {
    return;
  }

  try {
    openEditor([file]);
  } catch (error) {
    console.log(error);
  }
}

/**
 * @param {string} prNumber
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
 * @param {string} content
 * @returns {Promise<URL>}
 */
async function addNewChangelog(prNumber, category, content) {
  const file = new URL(
    `../changelog_unreleased/${category}/${prNumber}.md`,
    import.meta.url,
  );
  await fs.writeFile(file, content);
  return file;
}

/**
 * @param {string} title
 * @param {string} user
 * @param {number} prNumber
 * @param {string} string
 * @returns {Promise<string>}
 */
async function createChangelog(title, user, prNumber, category) {
  const templateFile = new URL(
    "../changelog_unreleased/TEMPLATE.md",
    import.meta.url,
  );
  const changelogTemplate = await fs.readFile(templateFile, "utf8");

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
    .replace(inputCommentPart, generateComment(syntax, "Input") + "\n")
    .replace(
      stableCommentPart,
      generateComment(syntax, "Prettier stable") + "\n",
    )
    .replace(mainCommentPart, generateComment(syntax, "Prettier main") + "\n");
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
    case "mjml":
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
      return "flow";
    case "javascript":
    case "api":
    case "misc":
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
function generateComment(syntax, comment) {
  switch (syntax) {
    case "md":
    case "mdx":
    case "html":
      return `<!-- ${comment} -->`;
    case "sh":
    case "gql":
    case "yaml":
      return `# ${comment}`;
    case "hbs":
      return `{{! ${comment} }}`;
    case "css":
      return `/* ${comment} */`;
    default:
      return `// ${comment}`;
  }
}

await generateChangelog();
