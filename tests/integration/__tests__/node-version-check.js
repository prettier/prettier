// Dev version
const minimalVersion = 22;

describe("Check Node.js version", () => {
  for (const version of [
    "0.10.0",
    "0.12.0",
    ...(function* () {
      for (let major = 4; major < minimalVersion; major++) {
        if (major >= 26 || major % 2 === 0) {
          yield `${major}.0.0`;
        }
      }
    })(),
  ]) {
    test(version, async () => {
      await expect(() =>
        runCli("cli/", ["--version"], { mockNodeVersion: version }),
      ).rejects.toThrow(
        /Prettier requires at least version \d+ of Node.js, please upgrade!/,
      );
    });
  }

  for (const version of [`${minimalVersion}.0.0`, "current"]) {
    test(version, async () => {
      const { stdout } = await runCli("cli/", ["--version"], {
        mockNodeVersion: version === "current" ? undefined : version,
      });
      expect(typeof stdout).toBe("string");
    });
  }
});
