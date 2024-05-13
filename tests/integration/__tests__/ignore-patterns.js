describe("ignores", () => {
  it("should ignore files listed in package.json > prettier.ignores", () => {
    runCli("cli/ignores/package-json", ["./ignored.js"]).test({
      stderr: "",
      status: 0,
    });
  });
});
