"use strict";

const chalk = require("chalk");
const { string: outdentString } = require("outdent");
const execa = require("execa");
const { logPromise, waitForEnter } = require("../utils");

/**
 * Retry "npm publish" when to enter OTP is failed.
 */
async function retryNpmPublish() {
  const runNpmPublish = () =>
    execa("npm", ["publish"], {
      cwd: "./dist",
      stdio: "inherit", // we need to input OTP if 2FA enabled
    });
  for (let i = 5; i > 0; i--) {
    try {
      return await runNpmPublish();
    } catch (error) {
      if (error.code === "EOTP" && i > 0) {
        console.log(`To enter OTP is failed, you can retry it ${i} times.`);
        continue;
      }
      throw error;
    }
  }
}

module.exports = async function ({ dry, version }) {
  if (dry) {
    return;
  }

  await logPromise("Publishing to npm", retryNpmPublish());

  console.log(
    outdentString(chalk`
      {green.bold Prettier ${version} published!}

      {yellow.bold Some manual steps are necessary.}

      {bold.underline Create a GitHub Release}
      - Go to {cyan.underline https://github.com/prettier/prettier/releases/new?tag=${version}}
      - Copy release notes from {yellow CHANGELOG.md}
      - Press {bgGreen.black  Publish release }

      {bold.underline Test the new release}
      - In a new session, run {yellow npm i prettier@latest} in another directory
      - Test the API and CLI

      After that, we can proceed to bump this repo's Prettier dependency.
      Press ENTER to continue.
    `)
  );
  await waitForEnter();
};
