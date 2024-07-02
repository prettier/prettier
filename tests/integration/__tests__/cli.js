import fs from "node:fs";
import { prettierCli } from "../env.js";

describe("CLI", () => {
  test("CLI should be executable.", () => {
    expect(() => fs.accessSync(prettierCli, fs.constants.X_OK)).not.toThrow();
  });
});
