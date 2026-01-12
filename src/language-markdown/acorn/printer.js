import * as assert from "#universal/assert";
import postprocess from "../../language-js/parse/postprocess/index.js";
import createParser from "../../language-js/parse/utilities/create-parser.js";
import wrapExpression from "../../language-js/parse/utilities/wrap-expression.js";

const transformJsExpression = ({ text, ast, comments }) => {
  const expressionRoot = wrapExpression(ast, { text });
  expressionRoot.comments = comments;

  if (ast.type === "Program") {
    delete expressionRoot.node;
  }

  return postprocess(expressionRoot, { text });
};

const transformJsProgram = ({ text, ast, comments }) => {
  ast.comments = comments;
  return postprocess(ast, { text });
};

const prettierPlugins = new Map();
const createPlugin = (mdxParserName, jsParserName, transform) => {
  if (!prettierPlugins.has(mdxParserName)) {
    prettierPlugins.set(mdxParserName, {
      parsers: {
        [mdxParserName]: createParser((_text, options) => {
          // TODO: support `__mdx_js_expression` and `__mdx_acorn` directly in ESTree printer
          options.parser = jsParserName;
          return transform(options.__mdx_parse_result);
        }),
      },
    });
  }

  return prettierPlugins.get(mdxParserName);
};

const createPrint =
  ({ jsParserName, getParseResult, transform }) =>
  async (textToDoc, print, path, options) => {
    const mdxParserName = `__mdx_${jsParserName.startsWith("__") ? jsParserName.slice(2) : jsParserName}`;
    const program = path.node.data.estree;
    const parseResult = getParseResult(program);
    const plugin = createPlugin(mdxParserName, jsParserName, transform);

    return await textToDoc(parseResult.text, {
      parser: mdxParserName,
      plugins: [...options.plugins, plugin],
      __mdx_parse_result: parseResult,
    });
  };

const printJsExpression = createPrint({
  jsParserName: "__js_expression",
  getParseResult(program) {
    if (program.isProgram) {
      return program.parseResult;
    }

    const { body } = program;

    /* c8 ignore next */
    if (process.env.NODE_ENV !== "production") {
      assert.ok(
        body.length === 1 &&
          body[0].type === "ExpressionStatement" &&
          body[0].expression.type === "ThisExpression" &&
          body[0].expression.isExpressionRoot &&
          body[0].expression.parseResult,
      );
    }

    return body[0].expression.parseResult;
  },
  transform: transformJsExpression,
});

const printJsProgram = createPrint({
  jsParserName: "acorn",
  getParseResult(program) {
    if (process.env.NODE_ENV !== "production") {
      assert.ok(program.isProgram);
    }

    return program.parseResult;
  },
  transform: transformJsProgram,
});

export { printJsExpression, printJsProgram };
