import execa from "execa";
import step from "../../steps/install-dependencies.js";
import { updateInjectedValues } from "../helpers.js";

describe("install-dependencies", () => {
  it("calls rm, yarn and git", async () => {
    await expect(step()).resolves.toBe();
    expect(execa.mock.calls.length).toBe(3);
    expect(execa.mock.calls[0]).toEqual(["rm", ["-rf", "node_modules"]]);
    expect(execa.mock.calls[1]).toEqual([
      "yarn",
      ["--silent", "install"],
      undefined,
    ]);
    expect(execa.mock.calls[2]).toEqual(["git", ["ls-files", "-m"], undefined]);
  });

  it("throws an error when lockfile needs to be updated", async () => {
    updateInjectedValues({ execa: { stdout: "something" } });
    await expect(step()).rejects.toThrowError(
      "The lockfile needs to be updated, commit it before making the release."
    );
    expect(execa.mock.calls.length).toBe(3);
    expect(execa.mock.calls[0]).toEqual(["rm", ["-rf", "node_modules"]]);
    expect(execa.mock.calls[1]).toEqual([
      "yarn",
      ["--silent", "install"],
      undefined,
    ]);
    expect(execa.mock.calls[2]).toEqual(["git", ["ls-files", "-m"], undefined]);
  });
});
