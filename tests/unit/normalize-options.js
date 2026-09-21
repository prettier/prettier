import normalizeCliOptions from "../../src/cli/options/normalize-cli-options.js";
import normalizeOptions from "../../src/main/normalize-options.js";

const optionInfos = [
  { name: "width", type: "int", alias: "w" },
  { name: "plugin", type: "path", array: true },
  { name: "enabled", type: "boolean" },
];

test("CLI normalization handles positional arguments, aliases and repeated flags", () => {
  expect(normalizeCliOptions({ w: 80 }, optionInfos)).toStrictEqual({
    width: 80,
  });
  expect(
    normalizeCliOptions(
      {
        _: ["file.js"],
        width: ["40", "80"],
        plugin: "plugin.js",
        enabled: [true, false],
      },
      optionInfos,
    ),
  ).toStrictEqual({
    _: ["file.js"],
    width: 80,
    plugin: ["plugin.js"],
    enabled: false,
  });
});

test("API normalization does not coerce CLI-style integer or array values", () => {
  expect(() => normalizeOptions({ width: "80" }, optionInfos)).toThrow();
  expect(() => normalizeOptions({ width: [40, 80] }, optionInfos)).toThrow();
  expect(() =>
    normalizeOptions({ plugin: "plugin.js" }, optionInfos),
  ).toThrow();
  expect(() =>
    normalizeOptions({ enabled: [true, false] }, optionInfos),
  ).toThrow();
  expect(
    normalizeOptions(
      { width: 80, plugin: ["plugin.js"], enabled: false },
      optionInfos,
    ),
  ).toStrictEqual({ width: 80, plugin: ["plugin.js"], enabled: false });
});

test.each([normalizeOptions, normalizeCliOptions])(
  "normalization preserves explicit pass-through options",
  (normalize) => {
    expect(
      normalize({ custom: 1, ignored: 2 }, [], { passThrough: ["custom"] }),
    ).toStrictEqual({ custom: 1 });
    expect(normalize({ custom: 1 }, [], { passThrough: true })).toStrictEqual({
      custom: 1,
    });
  },
);
