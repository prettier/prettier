import { normalizeOptionSettings } from "../../src/main/support.js";

function getNormalizedDefault(optionSettings) {
  const [{ default: normalizedDefault }] = normalizeOptionSettings({
    testOption: optionSettings,
  });
  return normalizedDefault;
}

describe("normalizeOptionSettings default handling", () => {
  test("keeps a plain array default of an `array` option (#19012)", () => {
    expect(
      getNormalizedDefault({
        type: "string",
        array: true,
        default: ["a", "b"],
      }),
    ).toStrictEqual(["a", "b"]);
  });

  test("keeps an empty array default without throwing", () => {
    expect(
      getNormalizedDefault({ type: "string", array: true, default: [] }),
    ).toStrictEqual([]);
  });

  test("unwraps the redundant-default `[{ value }]` format", () => {
    expect(
      getNormalizedDefault({
        type: "string",
        array: true,
        default: [{ value: ["a"] }],
      }),
    ).toStrictEqual(["a"]);
  });

  test("unwraps to the latest value of a redundant-default list", () => {
    expect(
      getNormalizedDefault({
        type: "choice",
        default: [{ value: "old" }, { value: "new" }],
      }),
    ).toBe("new");
  });

  test("keeps a scalar default", () => {
    expect(getNormalizedDefault({ type: "string", default: "x" })).toBe("x");
  });
});
