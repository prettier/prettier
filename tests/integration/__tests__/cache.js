import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

function resolveDir(dir) {
  return fileURLToPath(new URL(`../${dir}/`, import.meta.url));
}

describe("--cache option", () => {
  const dir = resolveDir("cli/cache");
  const defaultCacheFile = path.join(
    dir,
    "node_modules/.cache/prettier/.prettier-cache"
  );

  const nonDefaultCacheFileName = ".non-default-cache-file";
  const nonDefaultCacheFilePath = path.join(dir, nonDefaultCacheFileName);

  let contentA;
  let contentB;

  beforeAll(async () => {
    contentA = await fs.readFile(path.join(dir, "a.js"), "utf8");
    contentB = await fs.readFile(path.join(dir, "b.js"), "utf8");
  });

  afterEach(async () => {
    await fs.rm(path.join(dir, "node_modules"), {
      force: true,
      recursive: true,
    });
    await fs.rm(nonDefaultCacheFilePath, { force: true });
    await fs.writeFile(path.join(dir, "a.js"), contentA);
    await fs.writeFile(path.join(dir, "b.js"), contentB);
  });

  it("throw error when cache-strategy is invalid", async () => {
    const { stderr } = await runPrettier(dir, [
      "--cache",
      "--cache-strategy",
      "invalid",
      ".",
    ]);
    expect(stderr.trim()).toBe(
      '[error] Invalid --cache-strategy value. Expected "content" or "metadata", but received "invalid".'
    );
  });

  it("throws error when use with --stdin-filepath", async () => {
    const { stderr } = await runPrettier(
      dir,
      ["--cache", "--stdin-filepath", "foo.js"],
      { input: "const a = a;" }
    );
    expect(stderr.trim()).toBe("[error] `--cache` cannot be used with stdin.");
  });

  it("throws error when use `--cache-strategy` without `--cache`.", async () => {
    const { stderr } = await runPrettier(
      dir,
      ["foo.js", "--cache-strategy", "content"],
      {
        input: "const a = a;",
      }
    );
    expect(stderr.trim()).toBe(
      "[error] `--cache-strategy` cannot be used without `--cache`."
    );
  });

  it("throws error when `--cache-location` is a directory.", async () => {
    const { stderr } = await runPrettier(dir, [
      "foo.js",
      "--cache",
      "--cache-location",
      "dir",
    ]);
    expect(stderr.trim()).toEqual(
      expect.stringMatching(
        /\[error] Resolved --cache-location '.+' is a directory/
      )
    );
  });

  describe("--cache-strategy metadata", () => {
    it("creates default cache file named `node_modules/.cache/prettier/.prettier-cache`", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT"
      );
      await runPrettier(dir, ["--cache", "--cache-strategy", "metadata", "."]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrowError();
    });

    it("doesn't format when cache is available", async () => {
      const { stdout: firstStdout } = await runPrettier(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(cached\)$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when a file has been updated.", async () => {
      const cliArguments = [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ];
      const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      // Update `a.js`
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;");

      const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when timestamp has been updated", async () => {
      const cliArguments = [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ];
      const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      // update timestamp
      const time = new Date();
      await fs.utimes(path.join(dir, "a.js"), time, time);

      const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when options has been updated.", async () => {
      const { stdout: firstStdout } = await runPrettier(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--cache",
        "--cache-strategy",
        "metadata",
        "--write",
        "--trailing-comma",
        "all",
        ".",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );
    });

    it("re-formats after execution without write.", async () => {
      await runPrettier(dir, ["--cache", "--cache-strategy", "metadata", "."]);

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--write",
        "--cache",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when multiple cached files are updated.", async () => {
      const cliArguments = [
        "--write",
        "--cache",
        "--cache-strategy",
        "metadata",
        ".",
      ];
      await runPrettier(dir, cliArguments);

      // Update `a.js` to unformatted
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;    ");

      // Update `b.js` but still formatted
      const time = new Date();
      await fs.utimes(path.join(dir, "b.js"), time, time);

      await runPrettier(dir, ["--cache", "--cache-strategy", "metadata", "."]);

      const { stdout: thirdStdout } = await runPrettier(dir, cliArguments);
      expect(thirdStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("doesn't cache files when write error.", async () => {
      const {
        stdout: firstStdout,
        stderr: firstStderr,
        status: firstStatus,
      } = await runPrettier(
        dir,
        ["--write", "--cache", "--cache-strategy", "metadata", "."],
        {
          mockWriteFileErrors: {
            "a.js": "EACCES: permission denied.",
          },
        }
      );
      expect(firstStatus).toBe(2);
      expect(firstStderr).toBe(
        '[error] Unable to write file "a.js".\n' +
          "[error] EACCES: permission denied. (mocked error)"
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--list-different",
        "--cache",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      expect(secondStdout).toBe("a.js");
    });

    it("removes cache file when run Prettier without `--cache` option", async () => {
      await runPrettier(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        ".",
      ]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrowError();
      await runPrettier(dir, ["--write", "."]);
      await expect(fs.stat(defaultCacheFile)).rejects.toThrowError();
    });
  });

  describe("--cache-strategy content", () => {
    it("creates default cache file named `node_modules/.cache/prettier/.prettier-cache`", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT"
      );
      await runPrettier(dir, ["--cache", "--cache-strategy", "content", "."]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrowError();
    });

    it("doesn't format when cache is available", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        ".",
      ];
      const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(cached\)$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when a file has been updated.", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        ".",
      ];
      const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      // Update `a.js`
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;");

      const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("doesn't re-format when timestamp has been updated", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        ".",
      ];
      const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      // update timestamp
      const time = new Date();
      await fs.utimes(path.join(dir, "a.js"), time, time);

      const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(cached\)$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when options has been updated.", async () => {
      const { stdout: firstStdout } = await runPrettier(dir, [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        ".",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "content",
        "--trailing-comma",
        "all",
        ".",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );
    });

    it("re-formats after execution without write.", async () => {
      await runPrettier(dir, ["--cache", "--cache-strategy", "content", "."]);

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--write",
        "--cache",
        "--cache-strategy",
        "content",
        ".",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("re-formats when multiple cached files are updated.", async () => {
      const cliArguments = [
        "--write",
        "--cache",
        "--cache-strategy",
        "content",
        ".",
      ];
      await runPrettier(dir, cliArguments);

      // Update `a.js` to unformatted
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;    ");

      // Update `b.js` but still formatted
      const time = new Date();
      await fs.utimes(path.join(dir, "b.js"), time, time);

      await runPrettier(dir, ["--cache", "--cache-strategy", "content", "."]);

      const { stdout: thirdStdout } = await runPrettier(dir, cliArguments);
      expect(thirdStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms \(cached\)$/),
        ])
      );
    });

    it("doesn't cache files when write error.", async () => {
      const {
        stdout: firstStdout,
        stderr: firstStderr,
        status: firstStatus,
      } = await runPrettier(
        dir,
        ["--write", "--cache", "--cache-strategy", "content", "."],
        {
          mockWriteFileErrors: {
            "a.js": "EACCES: permission denied.",
          },
        }
      );
      expect(firstStatus).toBe(2);
      expect(firstStderr).toBe(
        "[error] Unable to write file \"a.js\".\n"+
        "[error] EACCES: permission denied. (mocked error)"
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/),
          expect.stringMatching(/^b\.js .+ms$/),
        ])
      );

      const { stdout: secondStdout } = await runPrettier(dir, [
        "--list-different",
        "--cache",
        "--cache-strategy",
        "content",
        ".",
      ]);
      expect(secondStdout).toBe("a.js");
    });

    it("removes cache file when run Prettier without `--cache` option", async () => {
      await runPrettier(dir, ["--cache", "--write", "."]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrowError();
      await runPrettier(dir, ["--write", "."]);
      await expect(fs.stat(defaultCacheFile)).rejects.toThrowError();
    });
  });

  describe("--cache-location", () => {
    it("doesn't create default cache file when `--cache-location` exists", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT"
      );
      await runPrettier(dir, [
        "--cache",
        "--cache-location",
        nonDefaultCacheFileName,
        ".",
      ]);
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT"
      );
    });

    it("throws error for invalid JSON file", async () => {
      const { stderr } = await runPrettier(dir, [
        "--cache",
        "--cache-location",
        "a.js",
        ".",
      ]);
      expect(stderr.trim()).toEqual(
        expect.stringMatching(/\[error] '.+' isn't a valid JSON file/)
      );
    });

    describe("file", () => {
      it("creates the cache file at location specified by `--cache-location`", async () => {
        await expect(fs.stat(nonDefaultCacheFilePath)).rejects.toHaveProperty(
          "code",
          "ENOENT"
        );
        await runPrettier(dir, [
          "--cache",
          "--cache-location",
          nonDefaultCacheFileName,
          ".",
        ]);
        await expect(
          fs.stat(nonDefaultCacheFilePath)
        ).resolves.not.toThrowError();
      });

      it("does'nt format when cache is available", async () => {
        const cliArguments = [
          "--cache",
          "--write",
          "--cache-location",
          nonDefaultCacheFileName,
          ".",
        ];
        const { stdout: firstStdout } = await runPrettier(dir, cliArguments);
        expect(firstStdout.split("\n")).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^a\.js .+ms$/),
            expect.stringMatching(/^b\.js .+ms$/),
          ])
        );

        const { stdout: secondStdout } = await runPrettier(dir, cliArguments);
        expect(secondStdout.split("\n")).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^a\.js .+ms \(cached\)$/),
            expect.stringMatching(/^b\.js .+ms \(cached\)$/),
          ])
        );
      });
    });
  });
});
