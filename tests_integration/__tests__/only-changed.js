"use strict";

const path = require("path");
const findCacheDir = require("find-cache-dir");

const runPrettier = require("../runPrettier");
const ChangedCache = require("../../src/cli/changed-cache");

// Cache name must be kept consistent with value in the implementation.
const cacheName = "changed";
const cachePath = path.join(findCacheDir({ name: "prettier" }), cacheName);

describe("create cache with --write --only-changed + unformatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "unformatted.js"
  ]).test({
    write: [{ filename: "unformatted.js" }, { filename: cachePath }],
    status: 0
  });
});

describe("create cache with --write --only-changed + formatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: cachePath }],
    status: 0
  });
});

describe("detect unchanged with --write --only-changed + formatted file", () => {
  const res = runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: cachePath }],
    status: 0
  });

  const cacheContents = res.write[0].content;

  runPrettier(
    "cli/only-changed",
    ["--write", "--only-changed", "formatted.js"],
    {
      virtualFiles: {
        [cachePath]: cacheContents
      }
    }
  ).test({
    write: [{ filename: cachePath, content: cacheContents }],
    status: 0
  });
});

describe("detect config change with --write --only-changed + unformatted file", () => {
  const resBefore = runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "unformatted.js"
  ]).test({
    write: [{ filename: "unformatted.js" }, { filename: cachePath }],
    status: 0
  });

  const cacheContentsBefore = resBefore.write[1].content;

  const resAfter = runPrettier(
    "cli/only-changed",
    ["--write", "--only-changed", "--use-tabs", "unformatted.js"],
    {
      virtualFiles: {
        [cachePath]: cacheContentsBefore
      }
    }
  ).test({
    write: [{ filename: "unformatted.js" }, { filename: cachePath }],
    status: 0
  });

  const cacheContentsAfter = resAfter.write[1].content;

  expect(cacheContentsAfter).not.toBe(cacheContentsBefore);
});

describe("ChangedCache", () => {
  it("should log errors when opening the cache file", () => {
    const errLogger = jest.fn();
    const msg = "open-cache-file-error";

    new ChangedCache({
      location: cachePath,
      readFile: () => {
        throw new Error(msg);
      },
      writeFile: () => {},
      context: { logger: { error: errLogger } },
      supportInfo: {}
    });

    expect(errLogger).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it("should log errors when parsing the cache file", () => {
    const errLogger = jest.fn();

    new ChangedCache({
      location: cachePath,
      readFile: () => "invalid json",
      writeFile: () => {},
      context: { logger: { error: errLogger } },
      supportInfo: {}
    });

    expect(errLogger).toHaveBeenCalledWith(
      expect.stringContaining("cache content")
    );
  });

  it("should log errors when closing the cache file", () => {
    const errLogger = jest.fn();
    const msg = "close-cache-file-error";

    const changedCache = new ChangedCache({
      location: cachePath,
      readFile: () => "{}",
      writeFile: () => {
        throw new Error(msg);
      },
      context: { logger: { error: errLogger } },
      supportInfo: {}
    });
    changedCache.close();

    expect(errLogger).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it("should log errors when serializing the cache contents", () => {
    const errLogger = jest.fn();

    const changedCache = new ChangedCache({
      location: cachePath,
      readFile: () => "{}",
      writeFile: () => {},
      context: { logger: { error: errLogger } },
      supportInfo: {}
    });
    const mirror = {};
    mirror.self = mirror;
    changedCache.cache = mirror;
    changedCache.close();

    expect(errLogger).toHaveBeenCalledWith(
      expect.stringContaining("serialize cache")
    );
  });
});
