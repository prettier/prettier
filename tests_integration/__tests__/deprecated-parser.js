"use strict";

const prettier = require("prettier/local");

let warnings = "";

beforeAll(() => {
  jest
    .spyOn(console, "warn")
    .mockImplementation(text => (warnings += text + "\n"));
});

beforeEach(() => {
  warnings = "";
});

afterAll(() => {
  jest.restoreAllMocks();
});

test("API format with deprecated parser (postcss) should work", () => {
  expect(() =>
    prettier.format("body { color: #131313; }", { parser: "postcss" })
  ).not.toThrowError();
  expect(warnings).toMatchSnapshot();
});

test("API format with deprecated parser (babylon) should work and do not report the same deprecation warning more than once", () => {
  expect(() => {
    prettier.format("hello_world( )", { parser: "babylon" });
    prettier.format("hello_world( )", { parser: "babylon" });
  }).not.toThrowError();
  expect(warnings).toMatchInlineSnapshot(`
"{ parser: \\"babylon\\" } is deprecated; we now treat it as { parser: \\"babel\\" }.
"
`);
});
