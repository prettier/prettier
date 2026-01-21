describe("default exclude files", () => {
  test("should ignore when expand directory", async () => {
    expect(await getMatchedFiles(["."])).toStrictEqual([
      "foo.js",
      "in-directory/foo.js",
    ]);
    expect(await getMatchedFiles(["in-directory"])).toStrictEqual([
      "in-directory/foo.js",
    ]);
  });

  test("should allow explicit path", async () => {
    expect(await getMatchedFiles(["pnpm-lock.yaml"])).toStrictEqual([
      "pnpm-lock.yaml",
    ]);
    expect(
      await getMatchedFiles(["pnpm-lock.yaml", "in-directory/pnpm-lock.yaml"]),
    ).toStrictEqual(["pnpm-lock.yaml", "in-directory/pnpm-lock.yaml"]);
    expect(
      await getMatchedFiles(["in-directory/pnpm-lock.yaml", "."]),
    ).toStrictEqual([
      "in-directory/pnpm-lock.yaml",
      "foo.js",
      "in-directory/foo.js",
    ]);
  });

  test("should match when using pattern", async () => {
    expect(await getMatchedFiles(["*.yaml"])).toStrictEqual(["pnpm-lock.yaml"]);
    expect(await getMatchedFiles(["**/*.yaml"])).toStrictEqual([
      "in-directory/pnpm-lock.yaml",
      "pnpm-lock.yaml",
    ]);
    expect(await getMatchedFiles(["**/*"])).toStrictEqual([
      "foo.js",
      "in-directory/foo.js",
      "in-directory/pnpm-lock.yaml",
      "pnpm-lock.yaml",
    ]);
    // We don't support this
    // expect(await getMatchedFiles(["in-*/"])).toStrictEqual([]);
  });

  test("with negated pattern", async () => {
    expect(
      await getMatchedFiles(["!**/*pnpm-lock.yaml", "in-directory"]),
    ).toStrictEqual(["in-directory/foo.js"]);
  });
});

const EXPECTED_LOG_PREFIX = "[warn] ";
async function getMatchedFiles(patterns) {
  const { stderr } = await runCli("cli/default-exclude-files", [
    ...patterns,
    "--check",
  ]);

  const lines = stderr.split("\n");

  expect(lines.at(-1).endsWith("Run Prettier with --write to fix.")).toBe(true);
  expect(lines.every((line) => line.startsWith(EXPECTED_LOG_PREFIX))).toBe(
    true,
  );

  return lines
    .slice(0, -1)
    .map((line) => line.slice(EXPECTED_LOG_PREFIX.length));
}
