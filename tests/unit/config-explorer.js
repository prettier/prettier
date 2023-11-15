import path from "node:path";
import { getParentDirectories } from "../../src/config/prettier-config-explorer/common.js";

describe("getParentDirectories", () => {
  if (path.sep === "/") {
    test("posix", () => {
      expect([...getParentDirectories("/a/b")]).toEqual(["/a/b", "/a", "/"]);
      expect([...getParentDirectories("/a/b", "/a")]).toEqual(["/a/b", "/a"]);
      expect([...getParentDirectories("/a", "/b")]).toEqual(["/a", "/"]);
    });
  } else {
    test.only("win32", () => {
      expect([...getParentDirectories(String.raw`P:\\a\b`)]).toEqual([
        String.raw`P:\\a\b`,
        String.raw`P:\\a`,
        "P:\\",
      ]);
      expect([
        ...getParentDirectories(String.raw`P:\\a\b`, String.raw`P:\\a`),
      ]).toEqual([String.raw`P:\\a\b`, String.raw`P:\\a`]);
      expect([
        ...getParentDirectories(String.raw`P:\\a`, String.raw`P:\\b`),
      ]).toEqual([String.raw`P:\\a`, "P:\\"]);
    });
  }
});
