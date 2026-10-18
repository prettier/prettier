import { commentsPropertyInOptions } from "../../src/constants.js";
import { stripComments } from "../../src/language-js/utilities/strip-comments.js";

function strip(text, ranges) {
  return stripComments({
    originalText: text,
    [commentsPropertyInOptions]: ranges.map(([start, end]) => ({ start, end })),
  });
}

function reference(text, ranges) {
  for (const [start, end] of ranges) {
    text =
      text.slice(0, start) +
      text.slice(start, end).replaceAll(/[^\n]/g, " ") +
      text.slice(end);
  }
  return text;
}

test.each([
  ["", []],
  ["const a = 1;", []],
  [
    "/* a */x/* b */",
    [
      [0, 7],
      [8, 15],
    ],
  ],
  [
    "/*a*//*b*/",
    [
      [0, 5],
      [5, 10],
    ],
  ],
  ["a/*\r\nb\nc\u2028d\u2029*/z", [[1, 15]]],
  [
    "x/*😀*/y//é",
    [
      [1, 7],
      [8, 11],
    ],
  ],
  [
    "/*a*/ x /*b*/",
    [
      [8, 13],
      [0, 5],
    ],
  ],
  [
    "0123456789",
    [
      [2, 8],
      [4, 9],
    ],
  ],
])("masks comments without changing offsets: %j", (text, ranges) => {
  const actual = strip(text, ranges);
  expect(actual).toBe(reference(text, ranges));
  expect(actual.length).toBe(text.length);
});

test("reads comment ranges", () => {
  expect(
    stripComments({
      originalText: "a/*b*/c",
      [commentsPropertyInOptions]: [{ range: [1, 6] }],
    }),
  ).toBe("a     c");
});

test("matches the previous implementation", () => {
  let state = 87;
  const random = (max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
  const text = "code /*😀 é\r\nline\n*/ more \u2028\u2029 source ".repeat(20);
  for (let index = 0; index < 500; index++) {
    const ranges = Array.from({ length: random(30) }, () => {
      const start = random(text.length + 1);
      return [start, start + random(text.length - start + 1)];
    });
    expect(strip(text, ranges)).toBe(reference(text, ranges));
    const boundaries = ranges.flat().sort((a, b) => a - b);
    const ordered = [];
    for (let offset = 0; offset < boundaries.length; offset += 2) {
      ordered.push([boundaries[offset], boundaries[offset + 1]]);
    }
    expect(strip(text, ordered)).toBe(reference(text, ordered));
  }
});
