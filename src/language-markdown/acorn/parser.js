// TODO[@fisker]: Move this part to acorn parser and access from `options`
import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";
import * as assert from "#universal/assert";

let acorn;
const createParse =
  ({ transformArguments, result, parse }) =>
  (...arguments_) => {
    const parseOptions = transformArguments(...arguments_);

    acorn ??= AcornParser.extend(acornJsx());

    const comments = parseOptions.options.onComment;

    if (process.env.NODE_ENV !== "production") {
      assert.ok(Array.isArray(comments) && comments.length === 0);
    }

    const ast = parse(acorn, {
      ...parseOptions,
      options: { ...parseOptions.options, ranges: true },
    });

    return Object.defineProperty(
      {
        start: ast.start,
        end: ast.end,
        ...result,
      },
      "raw",
      {
        value: {
          ast,
          comments: comments.map((comment) => ({
            ...comment,
            range: [...comment.range],
          })),
          text: parseOptions.text,
        },
      },
    );
  };

const parse = createParse({
  transformArguments: (text, options) => ({ text, options }),
  result: { type: "Program", body: [], isProgram: true },
  parse: (acorn, { text, options }) => acorn.parse(text, options),
});

const parseExpressionAt = createParse({
  transformArguments: (text, position, options) => ({
    text,
    position,
    options,
  }),
  result: { type: "ThisExpression", isExpressionRoot: true },
  parse: (acorn, { text, position, options }) =>
    acorn.parseExpressionAt(text, position, options),
});

export { parse, parseExpressionAt };
