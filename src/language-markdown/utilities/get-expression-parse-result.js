import * as assert from "#universal/assert";

function getExpressionParseResult(program) {
  if (program.isProgram) {
    return program.parseResult;
  }

  const { body } = program;

  /* c8 ignore next */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(
      body.length === 1 &&
        body[0].type === "ExpressionStatement" &&
        body[0].expression.isExpressionRoot &&
        body[0].expression.parseResult &&
        body[0].expression.type === "ObjectExpression" &&
        body[0].expression.properties.length === 1 &&
        body[0].expression.properties[0].type === "SpreadElement" &&
        body[0].expression.properties[0].argument.type === "Identifier" &&
        body[0].expression.properties[0].argument.name === "_",
    );
  }

  return body[0].expression.parseResult;
}

export { getExpressionParseResult };
