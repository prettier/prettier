import chalk from "chalk";
import step from "../../steps/validate-new-version.js";

describe("validate-new-version", () => {
  it("throws error for invalid semver", () => {
    expect(() => {
      step({ version: "foo" });
    }).toThrow("Invalid version specified");
  });
  it("throws error when version isn't greater than prev version", () => {
    expect(() => {
      step({ version: "0.0.1", previousVersion: "0.0.2" });
    }).toThrow(`Version ${chalk.yellow("0.0.1")} has already been published`);
  });
});
