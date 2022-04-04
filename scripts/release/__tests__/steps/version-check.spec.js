import { isVersionReleased } from "../../steps/wait-for-bot-release.js";

describe("isVersionReleased", () => {
  test("returns true for existing version", async () => {
    const result = await isVersionReleased("1.0.0");
    expect(result).toBe(true);
  });
  test("rejects true for non-existing version", async () => {
    await expect(
      isVersionReleased("999.0.0")
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"prettier@999.0.0 doesn\'t exit."'
    );
  });
});
