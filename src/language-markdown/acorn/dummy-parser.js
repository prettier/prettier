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
  const parseResult = {
    ast: program,
    comments: [],
    text,
  };

  return Object.defineProperty(program, "parseResult", {
    value: parseResult,
  });
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
