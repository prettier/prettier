import step from "../../steps/check-git-status.js";

describe("check-git-status", () => {
  it("does noting when there are no local changes", async () => {
    const result = await step();
    expect(result.command).toBe("git status --porcelain");
  });
});
