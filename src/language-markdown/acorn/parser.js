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

    const comments = [];
    const ast = parse(acorn, {
      ...parseOptions,
      options: {
        ...parseOptions.options,
        // Add ranges because our JS parser visit `range` instead of `start`/`end` first.
        ranges: true,
        // We don't want `micromark-extension-mdx-expression` to process comments
        onComment: comments,
        // We don't need tokens, we don't want `micromark-extension-mdx-expression` process tokens either
        onToken: undefined,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      const { onComment, onToken, preserveParens } = parseOptions.options;
      assert.ok(Array.isArray(onComment) && onComment.length === 0);
      assert.equal(onToken, undefined);
      assert.equal(preserveParens, true);
    }

    // Make `result.parseResult` non-enumerable, so it won't be processed by `micromark-extension-mdx-expression`
    // https://github.com/micromark/micromark-extension-mdx-expression/blob/2891b75ff9e985c6df208a47348e76ced05dbfed/packages/micromark-util-events-to-acorn/dev/lib/index.js#L124
    return Object.defineProperty(
      {
        start: ast.start,
        end: ast.end,
        ...result,
      },
      "parseResult",
      { value: { ast, comments, text: parseOptions.text } },
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
