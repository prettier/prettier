import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";

let acorn;
const createParse =
  ({ transformArguments, result, parse }) =>
  (...arguments_) => {
    const parseOptions = transformArguments(...arguments_);

    acorn ??= AcornParser.extend(acornJsx());

    const ast = parse(acorn, parseOptions);
    const comments = parseOptions.options.onComment.map((comment) => ({
      ...comment,
    }));

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
          comments,
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
