"use strict";

const fetch = require("node-fetch");
const { logPromise, processFile } = require("../utils");

async function update() {
  // Update dependents count
  const dependentsCountNpm = Number(
    (
      await (await fetch("https://www.npmjs.com/package/prettier")).text()
    ).match(/"dependentsCount":(\d+),/)[1]
  );
  const dependentsCountGithub = Number(
    (
      await (
        await fetch("https://github.com/prettier/prettier/network/dependents")
      ).text()
    )
      .replace(/\n/g, "")
      .match(
        /<svg.*?octicon-gist.*?>.*?<\/svg>\s*([\d,]+?)\s*Repositories\s*<\/a>/
      )[1]
      .replace(/,/g, "")
  );
  processFile("website/pages/en/index.js", (content) =>
    content
      .replace(
        /(<strong data-placeholder="dependent-npm">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountNpm)}$3`
      )
      .replace(
        /(<strong data-placeholder="dependent-github">)(.*?)(<\/strong>)/,
        `$1${formatNumber(dependentsCountGithub)}$3`
      )
  );
}

function formatNumber(value) {
  if (value < 1e4) {
    return String(value).slice(0, 1) + "0".repeat(String(value).length - 1);
  } else if (value < 1e6) {
    return Math.floor(value / 1e2) / 10 + "k";
  }
  return Math.floor(value / 1e5) / 10 + "m";
}

module.exports = async function (params) {
  await logPromise("Updating dependents count", update(params));
};
