import execa from "execa";
import step from "../../steps/check-git-status.js";
import { updateInjectedValues } from "../helpers.js";

describe("check-git-status", () => {
  it("does noting when there are no local changes", async () => {
    await expect(step()).resolves.toBe();
    expect(execa.mock.calls.length).toBe(1);
    expect(execa.mock.calls[0]).toEqual([
      "git",
      ["status", "--porcelain"],
      undefined,
    ]);
  });

  it("throws error when there are local changes", async () => {
    updateInjectedValues({ execa: { stdout: "change" } });
    await expect(step()).rejects.toThrowError(
      "Uncommitted local changes. Please revert or commit all local changes before making a release."
    );
    expect(execa.mock.calls.length).toBe(1);
    expect(execa.mock.calls[0]).toEqual([
      "git",
      ["status", "--porcelain"],
      undefined,
    ]);
  });
});
