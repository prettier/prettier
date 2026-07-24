import * as assert from "#universal/assert";
import { group, indent, softline } from "../../document/index.js";
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
  ({ jsParserName, getParseResult, transform, wrapDoc = (doc) => doc }) =>
  async (textToDoc, print, path, options) => {
    const mdxParserName = `__mdx_${jsParserName.startsWith("__") ? jsParserName.slice(2) : jsParserName}`;
    const program = path.node.data.estree;
    const parseResult = getParseResult(program);
    const plugin = createPlugin(mdxParserName, jsParserName, transform);

    const doc = await textToDoc(parseResult.text, {
      parser: mdxParserName,
      plugins: [...options.plugins, plugin],
      __mdx_parse_result: parseResult,
    });

    return wrapDoc(doc, parseResult);
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
          body[0].expression.parseResult,
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

    let { ast } = parseResult;
    if (ast.type === "ParenthesizedExpression") {
      ast = ast.expression;
    }

    /* c8 ignore next */
    if (process.env.NODE_ENV !== "production") {
      assert.ok(
        ast.type === "ObjectExpression" &&
          ast.properties.length === 1 &&
          ast.properties[0].type === "SpreadElement",
      );
    }

    return { ...parseResult, ast: ast.properties[0] };
  },
  transform: transformJsExpression,
  // Like `printJsxSpreadAttributeOrChild` in the JS printer: when the
  // expression has comments, allow breaking inside the braces so line
  // comments can't escape past the closing brace
  wrapDoc: (doc, { comments }) =>
    comments.length === 0 ? doc : group([indent([softline, doc]), softline]),
});

export { printJsExpression, printJsSpreadAttribute };
