import step from "../../steps/check-git-status.js";
import { updateInjectedValues } from "../helpers.js";

describe("check-git-status", () => {
  it("does noting when there are no local changes", async () => {
    await expect(step()).resolves.toBe();
  });

  it("throws error when there are local changes", async () => {
    updateInjectedValues({ execa: { stdout: "change" } });
    await expect(step()).rejects.toThrowError(
      "Uncommitted local changes. Please revert or commit all local changes before making a release."
    );
  });
});
