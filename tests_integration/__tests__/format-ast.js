"use strict";

const prettier = require("prettier/local");
const {outdent} = require("outdent");
const {parse} = require("../../src/language-js/parser-babel").parsers.babel

test("prettier.formatAST", () => {
  const code = outdent`
    const foo =              'bar'
  `;
  const options = {parser:"babel", originalText: code}

  const ast = parse(code, {}, options);
  const {formatted} = prettier.__debug.formatAST(ast, options)
  expect(formatted).toMatchSnapshot();
});
