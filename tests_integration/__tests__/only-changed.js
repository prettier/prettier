"use strict";

const runPrettier = require("../runPrettier");
const ChangedCache = require("../../src/cli/changed-cache");

describe("create cache with --write --only-changed + unformatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "unformatted.js"
  ]).test({
    write: [{ filename: "unformatted.js" }, { filename: ".prettiercache" }],
    status: 0
  });
});

describe("create cache with --write --only-changed + formatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: ".prettiercache" }],
    status: 0
  });
});

describe("create cache with --write --only-changed + formatted file + custom location", () => {
  process.env.PRETTIER_CACHE_LOCATION = ".custom";

  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: ".custom" }],
    status: 0
  });
});

describe("detect unchanged with --write --only-changed + formatted file", () => {
  process.env.PRETTIER_CACHE_LOCATION = "virtualFile";

  const res = runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: "virtualFile" }],
    status: 0
  });

  const cacheContents = res.write[0].content;

  runPrettier(
    "cli/only-changed",
    ["--write", "--only-changed", "formatted.js"],
    {
      virtualFile: cacheContents
    }
  ).test({
    write: [{ filename: "virtualFile", content: cacheContents }],
    status: 0
  });
});

describe("detect config change with --write --only-changed + unformatted file", () => {
  process.env.PRETTIER_CACHE_LOCATION = "virtualFile";

  const resBefore = runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "unformatted.js"
  ]).test({
    write: [{ filename: "unformatted.js" }, { filename: "virtualFile" }],
    status: 0
  });

  const cacheContentsBefore = resBefore.write[1].content;

  const resAfter = runPrettier(
    "cli/only-changed",
    ["--write", "--only-changed", "--use-tabs", "unformatted.js"],
    {
      virtualFile: cacheContentsBefore
    }
  ).test({
    write: [{ filename: "unformatted.js" }, { filename: "virtualFile" }],
    status: 0
  });

  const cacheContentsAfter = resAfter.write[1].content;

  expect(cacheContentsAfter).not.toBe(cacheContentsBefore);
});

describe("ChangedCache", () => {
  it("should log errors when opening the cache file", () => {
    const errLogger = jest.fn();
    const msg = "open-cache-file-error";

    new ChangedCache(
      {
        existsSync: () => true,
        readFileSync: () => {
          throw new Error(msg);
        }
      },
      ".prettiercache",
      { logger: { error: errLogger } },
      {}
    );

    expect(errLogger).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it("should log errors when parsing the cache file", () => {
    const errLogger = jest.fn();

    new ChangedCache(
      {
        existsSync: () => true,
        readFileSync: () => "invalid json"
      },
      ".prettiercache",
      { logger: { error: errLogger } },
      {}
    );

    expect(errLogger).toHaveBeenCalledWith(
      expect.stringContaining("cache content")
    );
  });

  it("should log errors when closing the cache file", () => {
    const errLogger = jest.fn();
    const msg = "close-cache-file-error";

    const changedCache = new ChangedCache(
      {
        existsSync: () => true,
        readFileSync: () => "{}",
        writeFileSync: () => {
          throw new Error(msg);
        }
      },
      ".prettiercache",
      { logger: { error: errLogger } },
      {}
    );
    changedCache.close();

    expect(errLogger).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it("should log errors when serializing the cache contents", () => {
    const errLogger = jest.fn();

    const changedCache = new ChangedCache(
      {
        existsSync: () => true,
        readFileSync: () => "{}",
        writeFileSync: () => {}
      },
      ".prettiercache",
      { logger: { error: errLogger } },
      {}
    );
    const mirror = {};
    mirror.self = mirror;
    changedCache.cache = mirror;
    changedCache.close();

    expect(errLogger).toHaveBeenCalledWith(
      expect.stringContaining("serialize cache")
    );
  });
});
