import prettier from "../../dist/esm/standalone.mjs";
import parserGraphql from "../../dist/esm/parser-graphql.mjs";
import parserCss from "../../dist/esm/parser-postcss.mjs";

test("formatting graphql with ESM bundle", () => {
  expect(
    prettier.format("query { child }", {
      parser: "graphql",
      plugins: [parserGraphql],
    })
  ).toMatchSnapshot();
});

test("formatting css with ESM bundle", () => {
  expect(
    prettier.format("body { color: red; }", {
      parser: "css",
      plugins: [parserCss],
    })
  ).toMatchSnapshot();
});
