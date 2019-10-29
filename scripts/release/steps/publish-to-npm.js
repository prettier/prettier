"use strict";

const chalk = require("chalk");
const dedent = require("dedent");
const execa = require("execa");
const { logPromise, waitForEnter } = require("../utils");

module.exports = async function({ dry, version }) {
  if (dry) {
    return;
  }

  await logPromise(
    "Publishing to npm",
    execa("npm", ["publish"], {
      cwd: "./dist",
      stdio: "inherit" // we need to input OTP if 2FA enabled
    })
  );

  console.log(
    dedent(chalk`
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
      Press any key to continue.
    `)
  );
  await waitForEnter();
};
