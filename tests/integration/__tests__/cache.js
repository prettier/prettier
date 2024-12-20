import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveDir(dir) {
  return fileURLToPath(new URL(`../${dir}/`, import.meta.url));
}

const runCliWithoutGitignore = (dir, args, options) =>
  runCli(dir, [...args, "--ignore-path", ".prettierignore"], options);

describe("--cache option", () => {
  const dir = resolveDir("cli/cache");
  const defaultCacheFile = path.join(
    dir,
    "node_modules/.cache/prettier/.prettier-cache",
  );

  const nonDefaultCacheFileName = ".non-default-cache-file";
  const directoryNameAsCacheFile = "directory-as-cache-file";
  const nonDefaultCacheFilePath = path.join(dir, nonDefaultCacheFileName);

  const contentA = `function a() {
  console.log("this is a.js")
}
`;
  const contentB = `function b() {
  console.log("this is b.js");
}
`;

  const clean = async () => {
    await fs.rm(path.join(dir, directoryNameAsCacheFile), {
      force: true,
      recursive: true,
    });
    await fs.rm(nonDefaultCacheFilePath, { force: true });
    await fs.rm(path.join(dir, "a.js"), { force: true });
    await fs.rm(path.join(dir, "b.js"), { force: true });
  };

  beforeAll(async () => {
    await clean();
    await fs.mkdir(path.join(dir, directoryNameAsCacheFile));
    await fs.writeFile(path.join(dir, "a.js"), contentA);
    await fs.writeFile(path.join(dir, "b.js"), contentB);
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
  afterAll(clean);

  it("throw error when cache-strategy is invalid", async () => {
    const { stderr } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--cache-strategy",
      "invalid",
      "*.js",
    ]);
    expect(stderr.trim()).toBe(
      '[error] Invalid --cache-strategy value. Expected "content" or "metadata", but received "invalid".',
    );
  });

  it("throws error when use with --stdin-filepath", async () => {
    const { stderr } = await runCliWithoutGitignore(
      dir,
      ["--cache", "--stdin-filepath", "foo.js"],
      { input: "const a = a;" },
    );
    expect(stderr.trim()).toBe(
      "[error] `--cache` cannot be used when formatting stdin.",
    );
  });

  it("throws error when use `--cache-strategy` without `--cache`.", async () => {
    const { stderr } = await runCliWithoutGitignore(
      dir,
      ["foo.js", "--cache-strategy", "content"],
      {
        input: "const a = a;",
      },
    );
    expect(stderr.trim()).toBe(
      "[error] `--cache-strategy` cannot be used without `--cache`.",
    );
  });

  it("throws error when `--cache-location` is a directory.", async () => {
    const { stderr } = await runCliWithoutGitignore(dir, [
      "foo.js",
      "--cache",
      "--cache-location",
      directoryNameAsCacheFile,
    ]);
    expect(stderr.trim()).toEqual(
      expect.stringMatching(
        /\[error\] Resolved --cache-location '.+' is a directory/u,
      ),
    );
  });

  describe("--cache-strategy metadata", () => {
    it("creates default cache file named `node_modules/.cache/prettier/.prettier-cache`", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT",
      );
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrow();
    });

    it("doesn't format when cache is available", async () => {
      const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(unchanged\) \(cached\)$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when a file has been updated.", async () => {
      const cliArguments = [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ];
      const { stdout: firstStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      // Update `a.js`
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;");

      const { stdout: secondStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when timestamp has been updated", async () => {
      const cliArguments = [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ];
      const { stdout: firstStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      // update timestamp
      const time = new Date();
      await fs.utimes(path.join(dir, "a.js"), time, time);

      const { stdout: secondStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when options has been updated.", async () => {
      const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "metadata",
        "--write",
        "--trailing-comma",
        "all",
        "*.js",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );
    });

    it("re-formats after execution without write.", async () => {
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--write",
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when multiple cached files are updated.", async () => {
      const cliArguments = [
        "--write",
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ];
      await runCliWithoutGitignore(dir, cliArguments);

      // Update `a.js` to unformatted
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;    ");

      // Update `b.js` but still formatted
      const time = new Date();
      await fs.utimes(path.join(dir, "b.js"), time, time);

      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);

      const { stdout: thirdStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(thirdStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("doesn't cache files when write error.", async () => {
      const {
        stdout: firstStdout,
        stderr: firstStderr,
        status: firstStatus,
      } = await runCliWithoutGitignore(
        dir,
        ["--write", "--cache", "--cache-strategy", "metadata", "*.js"],
        {
          mockWriteFileErrors: {
            "a.js": "EACCES: permission denied.",
          },
        },
      );
      expect(firstStatus).toBe(2);
      expect(firstStderr).toBe(
        '[error] Unable to write file "a.js":\n' +
          "[error] EACCES: permission denied. (mocked error)",
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--list-different",
        "--cache",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      expect(secondStdout).toBe("a.js");
    });

    it("removes cache file when run Prettier without `--cache` option", async () => {
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "metadata",
        "*.js",
      ]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrow();
      await runCliWithoutGitignore(dir, ["--write", "*.js"]);
      await expect(fs.stat(defaultCacheFile)).rejects.toThrow();
    });
  });

  describe("--cache-strategy content", () => {
    it("creates default cache file named `node_modules/.cache/prettier/.prettier-cache`", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT",
      );
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrow();
    });

    it("doesn't format when cache is available", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        "*.js",
      ];
      const { stdout: firstStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(unchanged\) \(cached\)$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when a file has been updated.", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        "*.js",
      ];
      const { stdout: firstStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      // Update `a.js`
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;");

      const { stdout: secondStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(secondStdout.split("\n")).toEqual(
        // the cache of `b.js` is only available.
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("doesn't re-format when timestamp has been updated", async () => {
      const cliArguments = [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        "*.js",
      ];
      const { stdout: firstStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      // update timestamp
      const time = new Date();
      await fs.utimes(path.join(dir, "a.js"), time, time);

      const { stdout: secondStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms \(unchanged\) \(cached\)$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when options has been updated.", async () => {
      const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "content",
        "--write",
        "*.js",
      ]);
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--write",
        "--cache-strategy",
        "content",
        "--trailing-comma",
        "all",
        "*.js",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );
    });

    it("re-formats after execution without write.", async () => {
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ]);

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--write",
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ]);
      expect(secondStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("re-formats when multiple cached files are updated.", async () => {
      const cliArguments = [
        "--write",
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ];
      await runCliWithoutGitignore(dir, cliArguments);

      // Update `a.js` to unformatted
      await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;    ");

      // Update `b.js` but still formatted
      const time = new Date();
      await fs.utimes(path.join(dir, "b.js"), time, time);

      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ]);

      const { stdout: thirdStdout } = await runCliWithoutGitignore(
        dir,
        cliArguments,
      );
      expect(thirdStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
        ]),
      );
    });

    it("doesn't cache files when write error.", async () => {
      const {
        stdout: firstStdout,
        stderr: firstStderr,
        status: firstStatus,
      } = await runCliWithoutGitignore(
        dir,
        ["--write", "--cache", "--cache-strategy", "content", "*.js"],
        {
          mockWriteFileErrors: {
            "a.js": "EACCES: permission denied.",
          },
        },
      );
      expect(firstStatus).toBe(2);
      expect(firstStderr).toBe(
        '[error] Unable to write file "a.js":\n' +
          "[error] EACCES: permission denied. (mocked error)",
      );
      expect(firstStdout.split("\n")).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^a\.js .+ms$/u),
          expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
        ]),
      );

      const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
        "--list-different",
        "--cache",
        "--cache-strategy",
        "content",
        "*.js",
      ]);
      expect(secondStdout).toBe("a.js");
    });

    it("removes cache file when run Prettier without `--cache` option", async () => {
      await runCliWithoutGitignore(dir, ["--cache", "--write", "*.js"]);
      await expect(fs.stat(defaultCacheFile)).resolves.not.toThrow();
      await runCliWithoutGitignore(dir, ["--write", "*.js"]);
      await expect(fs.stat(defaultCacheFile)).rejects.toThrow();
    });
  });

  describe("--cache-location", () => {
    it("doesn't create default cache file when `--cache-location` exists", async () => {
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT",
      );
      await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-location",
        nonDefaultCacheFileName,
        "*.js",
      ]);
      await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
        "code",
        "ENOENT",
      );
    });

    it("throws error for invalid JSON file", async () => {
      const { stderr } = await runCliWithoutGitignore(dir, [
        "--cache",
        "--cache-location",
        "a.js",
        "*.js",
      ]);
      expect(stderr.trim()).toEqual(
        expect.stringMatching(/\[error\] '.+' isn't a valid JSON file/u),
      );
    });

    describe("file", () => {
      it("creates the cache file at location specified by `--cache-location`", async () => {
        await expect(fs.stat(nonDefaultCacheFilePath)).rejects.toHaveProperty(
          "code",
          "ENOENT",
        );
        await runCliWithoutGitignore(dir, [
          "--cache",
          "--cache-location",
          nonDefaultCacheFileName,
          "*.js",
        ]);
        await expect(fs.stat(nonDefaultCacheFilePath)).resolves.not.toThrow();
      });

      it("does'nt format when cache is available", async () => {
        const cliArguments = [
          "--cache",
          "--write",
          "--cache-location",
          nonDefaultCacheFileName,
          "*.js",
        ];
        const { stdout: firstStdout } = await runCliWithoutGitignore(
          dir,
          cliArguments,
        );
        expect(firstStdout.split("\n")).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^a\.js .+ms$/u),
            expect.stringMatching(/^b\.js .+ms \(unchanged\)$/u),
          ]),
        );

        const { stdout: secondStdout } = await runCliWithoutGitignore(
          dir,
          cliArguments,
        );
        expect(secondStdout.split("\n")).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^a\.js .+ms \(unchanged\) \(cached\)$/u),
            expect.stringMatching(/^b\.js .+ms \(unchanged\) \(cached\)$/u),
          ]),
        );
      });
    });
  });
});
