import assert from "node:assert/strict";
import { describe, it } from "node:test";
import chalk from "chalk";
import validateNewVersion from "../steps/validate-new-version.js";

describe("validate-new-version", () => {
  it("throws error for missing version", () => {
    assert.throws(
      () => {
        validateNewVersion({});
      },
      { message: "'--version' is required" },
    );
  });
  it("throws error for invalid semver", () => {
    assert.throws(
      () => {
        validateNewVersion({ version: "foo" });
      },
      { message: `Invalid version '${chalk.red.underline("foo")}' specified` },
    );
  });
  it("throws error when version isn't greater than prev version", () => {
    assert.throws(
      () => {
        validateNewVersion({ version: "0.0.1", previousVersion: "0.0.2" });
      },
      {
        message: `Version '${chalk.yellow(
          "0.0.1",
        )}' has already been published`,
      },
    );
  });
});
