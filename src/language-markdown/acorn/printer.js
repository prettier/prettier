import postprocess from "../../language-js/parse/postprocess/index.js";
import createParser from "../../language-js/parse/utilities/create-parser.js";
import wrapExpression from "../../language-js/parse/utilities/wrap-expression.js";
import { getExpressionParseResult } from "../utilities/get-expression-parse-result.js";

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
  ({ jsParserName, mdxParserName, getParseResult, transform }) =>
  async (textToDoc, print, path, options) => {
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
  mdxParserName: "__mdx_js_expression",
  getParseResult: getExpressionParseResult,
  transform: transformJsExpression,
});

const printJsxSpreadAttribute = createPrint({
  jsParserName: "__js_expression",
  mdxParserName: "__mdx_jsx_spread_attribute",
  getParseResult: getExpressionParseResult,
  transform({ text, comments, ast }) {
    if (!(
      ast.type === "ParenthesizedExpression" &&
      ast.expression.type === "ObjectExpression" &&
      ast.expression.properties.length === 1 &&
      ast.expression.properties[0].type === "SpreadElement"
    )) {
      throw new Error("Unexpected result in JSX spread attribute.");
    }

    const { expression } = ast;

    return transformJsExpression({
      text,
      comments,
      ast: {
        type: "JSXSpreadAttribute",
        argument: expression.properties[0].argument,
        range: ast.range,
      },
    });
  },
});

export { printJsExpression, printJsxSpreadAttribute };
