"use strict";

const path = require("path");
const fs = require("fs/promises");
const { default: stripAnsi } = require("../../../vendors/strip-ansi.js");

const runPrettier = require("../run-prettier.js");

function resolveDir(dir) {
  return path.join(__dirname, "..", dir);
}

describe("--cache option", () => {
  const dir = resolveDir("cli/cache");
  const defaultCacheFile = path.join(dir, ".prettiercache");

  let contentA;
  let contentB;

  beforeAll(async () => {
    contentA = await fs.readFile(path.join(dir, "a.js"), "utf8");
    contentB = await fs.readFile(path.join(dir, "b.js"), "utf8");
  });

  afterEach(async () => {
    await fs.rm(defaultCacheFile);
    await fs.writeFile(path.join(dir, "a.js"), contentA);
    await fs.writeFile(path.join(dir, "b.js"), contentB);
  });

  it("creates default cache file named `.prettiercache`", async () => {
    await expect(fs.stat(defaultCacheFile)).rejects.toHaveProperty(
      "code",
      "ENOENT"
    );
    await runPrettier(dir, ["--cache", "."]);
    await expect(fs.stat(defaultCacheFile)).resolves.not.toThrowError();
  });

  it("does'nt format when cache is available", async () => {
    const { stdout: firstStdout } = await runPrettier(dir, [
      "--cache",
      "--write",
      ".",
    ]);
    expect(stripAnsi(firstStdout).split("\n").filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^a\.js .+ms$/),
        expect.stringMatching(/^b\.js .+ms$/),
      ])
    );

    const { stdout: secondStdout } = await runPrettier(dir, [
      "--cache",
      "--write",
      ".",
    ]);
    expect(stripAnsi(secondStdout).split("\n").filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^a\.js .+ms \(cached\)$/),
        expect.stringMatching(/^b\.js .+ms \(cached\)$/),
      ])
    );
  });

  it("re-formats when a file has been updated.", async () => {
    const { stdout: firstStdout } = await runPrettier(dir, [
      "--cache",
      "--write",
      ".",
    ]);
    expect(stripAnsi(firstStdout).split("\n").filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^a\.js .+ms$/),
        expect.stringMatching(/^b\.js .+ms$/),
      ])
    );

    // Update `a.js`
    await fs.writeFile(path.join(dir, "a.js"), "const a = `a`;");

    const { stdout: secondStdout } = await runPrettier(dir, [
      "--cache",
      "--write",
      ".",
    ]);
    expect(stripAnsi(secondStdout).split("\n").filter(Boolean)).toEqual(
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
      ".",
    ]);
    expect(stripAnsi(firstStdout).split("\n").filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^a\.js .+ms$/),
        expect.stringMatching(/^b\.js .+ms$/),
      ])
    );

    const { stdout: secondStdout } = await runPrettier(dir, [
      "--cache",
      "--write",
      "--trailing-comma",
      "all",
      ".",
    ]);
    expect(stripAnsi(secondStdout).split("\n").filter(Boolean)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^a\.js .+ms$/),
        expect.stringMatching(/^b\.js .+ms$/),
      ])
    );
  });
});
