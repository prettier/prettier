"use strict";
const fs = require("fs");
const path = require("path");
const globby = require("globby");

const CHANGELOG_DIR = "changelog_unreleased";
const CHANGELOG_ROOT = path.join(__dirname, `../${CHANGELOG_DIR}`);
const pathRegex = /^(angular|api|cli|css|flow|graphql|handlebars|html|javascript|json|less|lwc|markdown|mdx|scss|typescript|vue|yaml)[\\/]pr-(\d{4,})\.md$/;
const authorRegex = /by \[@(.*?)\]\(https:\/\/github\.com\/\1\)/;

const template = fs.readFileSync(
  path.join(CHANGELOG_ROOT, "TEMPLATE.md"),
  "utf8"
);
const templateComment = template.match(/<!--[\s\S]*?-->/);
const templateAuthorLink = template.match(authorRegex)[0];

const files = globby.sync(["**", "!TEMPLATE.md"], {
  cwd: CHANGELOG_ROOT,
  nodir: true
});

const exitWithMessage = message => {
  console.error(message);
  process.exit(1);
};

for (const file of files) {
  const match = file.match(pathRegex);
  const displayPath = path.join(CHANGELOG_DIR, file);
  if (!match) {
    exitWithMessage(
      `${displayPath} should name in form of "pr-{PR_NUMBER}.md".`
    );
  }
  const prNumber = match[2];
  const content = fs.readFileSync(path.join(CHANGELOG_ROOT, file), "utf8");
  const prLink = `[#${prNumber}](https://github.com/prettier/prettier/pull/${prNumber})`;

  if (!content.includes(prLink)) {
    exitWithMessage(`PR link "${prLink}" is missing in ${displayPath}.`);
  }
  if (!authorRegex.test(content)) {
    exitWithMessage(`Author link link is missing in ${displayPath}.`);
  }
  if (content.includes(templateComment)) {
    exitWithMessage(`Please comments at top from ${displayPath}.`);
  }
  if (content.includes(templateAuthorLink)) {
    exitWithMessage(
      `Please change author link to your github account in ${displayPath}.`
    );
  }
}

console.log("All changelog are fine.");
