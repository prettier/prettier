import makeString from "../../src/utilities/make-string.js";

const DOUBLE_QUOTE = '"';
const SINGLE_QUOTE = "'";

test("makeString", () => {
  expect(makeString("a", DOUBLE_QUOTE)).toBe(`${DOUBLE_QUOTE}a${DOUBLE_QUOTE}`);
  expect(makeString("a", SINGLE_QUOTE)).toBe(`${SINGLE_QUOTE}a${SINGLE_QUOTE}`);
  expect(makeString(`a${DOUBLE_QUOTE}`, DOUBLE_QUOTE)).toBe(
    `${DOUBLE_QUOTE}a\\${DOUBLE_QUOTE}${DOUBLE_QUOTE}`,
  );
  expect(makeString(`a${DOUBLE_QUOTE}`, SINGLE_QUOTE)).toBe(
    `${SINGLE_QUOTE}a${DOUBLE_QUOTE}${SINGLE_QUOTE}`,
  );
  expect(makeString(`a${DOUBLE_QUOTE}`, DOUBLE_QUOTE)).toBe(
    `${DOUBLE_QUOTE}a\\${DOUBLE_QUOTE}${DOUBLE_QUOTE}`,
  );

  expect(makeString(`a\\${DOUBLE_QUOTE}\\${SINGLE_QUOTE}`, DOUBLE_QUOTE)).toBe(
    `${DOUBLE_QUOTE}a\\${DOUBLE_QUOTE}${SINGLE_QUOTE}${DOUBLE_QUOTE}`,
  );
  expect(makeString(`a\\${DOUBLE_QUOTE}\\${SINGLE_QUOTE}`, SINGLE_QUOTE)).toBe(
    `${SINGLE_QUOTE}a${DOUBLE_QUOTE}\\${SINGLE_QUOTE}${SINGLE_QUOTE}`,
  );

  expect(
    makeString(`a\\\\${DOUBLE_QUOTE}\\\\${SINGLE_QUOTE}`, DOUBLE_QUOTE),
  ).toBe(
    `${DOUBLE_QUOTE}a\\\\\\${DOUBLE_QUOTE}\\\\${SINGLE_QUOTE}${DOUBLE_QUOTE}`,
  );
  expect(
    makeString(`a\\\\${DOUBLE_QUOTE}\\\\${SINGLE_QUOTE}`, SINGLE_QUOTE),
  ).toBe(
    `${SINGLE_QUOTE}a\\\\${DOUBLE_QUOTE}\\\\\\${SINGLE_QUOTE}${SINGLE_QUOTE}`,
  );

  expect(
    makeString(`a\\\\\\${DOUBLE_QUOTE}\\\\\\${SINGLE_QUOTE}`, DOUBLE_QUOTE),
  ).toBe(
    `${DOUBLE_QUOTE}a\\\\\\${DOUBLE_QUOTE}\\\\${SINGLE_QUOTE}${DOUBLE_QUOTE}`,
  );
  expect(
    makeString(`a\\\\\\${DOUBLE_QUOTE}\\\\\\${SINGLE_QUOTE}`, SINGLE_QUOTE),
  ).toBe(
    `${SINGLE_QUOTE}a\\\\${DOUBLE_QUOTE}\\\\\\${SINGLE_QUOTE}${SINGLE_QUOTE}`,
  );

  // Do not unescape `\a`
  expect(makeString(String.raw`\a`, SINGLE_QUOTE)).toBe(
    String.raw`${SINGLE_QUOTE}\a${SINGLE_QUOTE}`,
  );
});
