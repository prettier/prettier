// TODO[@fisker]: Move this part to acorn parser and access from `options`
import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";

let acorn;
function parse(text, options = {}) {
  const program = {
    /** @type {"Program"} */
    type: "Program",
    body: [],
    sourceType: options.sourceType ?? "module",
    start: 0,
    end: text.length,
    isProgram: true,
  };

  acorn ??= AcornParser.extend(acornJsx());

  try {
    acorn.parse(text, options);
  } catch (/** @type {any} */ error) {
    const message = String(error.message).replace(/ \(\d+:\d+\)$/, "");
    if (
      (error.raisedAt >= text.length &&
        !/^Export '.*' is not defined$/u.test(message)) ||
      message === "Unterminated comment"
    ) {
      throw error;
    }
  }

  return program;
}

/**
 * @returns {never}
 */
function parseExpressionAt() {
  throw new Error(
    "The `parseExpressionAt` method is not supported in `dummyAcorn`.",
  );
}

export { parse, parseExpressionAt };
