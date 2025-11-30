import WhitespaceUtilities from "../../src/utilities/whitespace-utilities.js";

it("constructor", () => {
  expect(() => new WhitespaceUtilities()).toThrow(TypeError);
  expect(() => new WhitespaceUtilities(1)).toThrow(TypeError);
  expect(() => new WhitespaceUtilities("")).toThrow(TypeError);
  expect(() => new WhitespaceUtilities([])).toThrow(TypeError);
  expect(() => new WhitespaceUtilities([""])).toThrow(TypeError);
  expect(() => new WhitespaceUtilities(["a"])).toThrow(TypeError);
  expect(() => new WhitespaceUtilities("a")).toThrow(TypeError);
  expect(() => new WhitespaceUtilities(["\r\n"])).toThrow(TypeError);

  expect(new WhitespaceUtilities("\r\n")).toBeInstanceOf(WhitespaceUtilities);
  expect(new WhitespaceUtilities(["\r", "\n"])).toBeInstanceOf(
    WhitespaceUtilities,
  );
});

const utils = new WhitespaceUtilities(" ");
describe("trimStart", () => {
  for (const [string, expected] of [
    ["", ""],
    [" ", ""],
    [" ".repeat(3), ""],
    ["a", "a"],
    ["a" + " ".repeat(3), "a   "],
    [" ".repeat(3) + "a", "a"],
    [" ".repeat(3) + "a" + " ".repeat(3), "a   "],
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.trimStart(string)).toBe(expected);
    });
  }
});

describe("trimEnd", () => {
  for (const [string, expected] of [
    ["", ""],
    [" ", ""],
    [" ".repeat(3), ""],
    ["a", "a"],
    ["a" + " ".repeat(3), "a"],
    [" ".repeat(3) + "a", "   a"],
    [" ".repeat(3) + "a" + " ".repeat(3), "   a"],
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.trimEnd(string)).toBe(expected);
    });
  }
});

describe("trim", () => {
  for (const [string, expected] of [
    ["", ""],
    [" ", ""],
    [" ".repeat(3), ""],
    ["a", "a"],
    ["a" + " ".repeat(3), "a"],
    [" ".repeat(3) + "a", "a"],
    [" ".repeat(3) + "a" + " ".repeat(3), "a"],
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.trim(string)).toBe(expected);
    });
  }
});

describe("getLeadingWhitespaceCount", () => {
  for (const [string, expected] of [
    ["", 0],
    [" ", 1],
    [" ".repeat(3), 3],
    ["a", 0],
    ["a" + " ".repeat(3), 0],
    [" ".repeat(3) + "a", 3],
    [" ".repeat(3) + "a" + " ".repeat(3), 3],
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.getLeadingWhitespaceCount(string)).toBe(expected);
    });
  }
});

describe("getTrailingWhitespaceCount", () => {
  for (const [string, expected] of [
    ["", 0],
    [" ", 1],
    [" ".repeat(3), 3],
    ["a", 0],
    ["a" + " ".repeat(3), 3],
    [" ".repeat(3) + "a", 0],
    [" ".repeat(3) + "a" + " ".repeat(3), 3],
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.getTrailingWhitespaceCount(string)).toBe(expected);
    });
  }
});

describe("split", () => {
  for (const string of [
    "",
    " ",
    " ".repeat(3),
    " a",
    " ".repeat(3) + "a",
    "a ",
    "a" + " ".repeat(3),
    " a ",
    " ".repeat(3) + "a" + " ".repeat(3),
    " a a   a ",
  ]) {
    it(JSON.stringify(string), () => {
      expect(utils.split(string)).toEqual(string.split(/ +/u));
    });
  }
});
