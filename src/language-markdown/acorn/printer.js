import * as assert from "#universal/assert";
import postprocess from "../../language-js/parse/postprocess/index.js";
import createParser from "../../language-js/parse/utilities/create-parser.js";
import wrapExpression from "../../language-js/parse/utilities/wrap-expression.js";

const transformJsExpression = ({ text, ast, comments }) => {
  const expressionRoot = wrapExpression({
    expression: ast,
    comments,
    text,
  });

  return postprocess(expressionRoot, { text });
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
    if (!parseResult) {
      return;
    }

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
  },
  transform: transformJsExpression,
});

const printJsSpreadAttribute = createPrint({
  jsParserName: "__js_expression",
  getParseResult(program) {
    const { parseResult } = program.body[0].expression;
    const { ast } = parseResult;
    const expression =
      ast.type === "ParenthesizedExpression" ? ast.expression : ast;

    if (
      expression.type === "ObjectExpression" &&
      expression.properties.length === 1 &&
      expression.properties[0].type === "SpreadElement"
    ) {
      const {
        properties: [spreadElement],
        ...rest
      } = expression;

      return {
        ...parseResult,
        ast: {
          ...rest,
          type: "JSXSpreadAttribute",
          argument: spreadElement.argument,
        },
      };
    }
  },
  transform: transformJsExpression,
});

export { printJsExpression, printJsSpreadAttribute };
