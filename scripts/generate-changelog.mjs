#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";
import createEsmUtils from "esm-utils";
import { CHANGELOG_CATEGORIES } from "./utils/changelog-categories.mjs";

const { __dirname } = createEsmUtils(import.meta);

const [prNumberString, category] = process.argv.slice(2);
if (!prNumberString || !category) {
  throw new Error("Two args are required.");
}
const prNumber = convertToNumber(prNumberString);
assertCatogory(category);

const { title, user } = await getPr(prNumber);

const newChangelog = await createChangelog(title, user, prNumber);

await addNewChangelog(prNumber, category, newChangelog);

console.log("Done");

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
 * @returns {Promise<void>}
 */
async function addNewChangelog(prNumber, category, newChangelog) {
  const newChangelogPath = path.resolve(
    __dirname,
    `../changelog_unreleased/${category}/${prNumber}.md`
  );
  await fs.writeFile(newChangelogPath, newChangelog);
}

/**
 * @param {string} title
 * @param {string} user
 * @param {number} prNumber
 * @returns {string}
 */
async function createChangelog(title, user, prNumber) {
  const changelogTemplatePath = path.resolve(
    __dirname,
    "../changelog_unreleased/TEMPLATE.md"
  );
  const changelogTemplate = await fs.readFile(changelogTemplatePath, "utf-8");

  const titlePart = "Title";
  const prNumberPart = "#XXXX";
  const userPart = "@user";

  return changelogTemplate
    .replace(titlePart, title)
    .replace(prNumberPart, `#${prNumber}`)
    .replace(userPart, `@${user}`);
}

/**
 * @param {unknown}
 * @returns {number}
 */
function convertToNumber(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`'${value}' is not number.`);
  }
  return parsed;
}

/**
 * @param {unknown}
 * @returns {void}
 */
function assertCatogory(category) {
  if (!CHANGELOG_CATEGORIES.includes(category)) {
    throw new Error(`${category} is invalid category`);
  }
}
