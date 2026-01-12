import postprocess from "../../language-js/parse/postprocess/index.js";
import createParser from "../../language-js/parse/utilities/create-parser.js";
import wrapExpression from "../../language-js/parse/utilities/wrap-expression.js";

const transformJsExpression = ({ text, ast, comments }) => {
  const expressionRoot = wrapExpression(ast, { text });
  expressionRoot.comments = comments;

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
          options.parser = jsParserName;
          return transform(options.__mdx_parse_result);
        }),
      },
    });
  }

  return prettierPlugins.get(mdxParserName);
};

const createPrint =
  ({ jsParserName, raw, transform }) =>
  async (textToDoc, print, path, options) => {
    const mdxParserName = `__mdx_${jsParserName.startsWith("__") ? jsParserName.slice(2) : jsParserName}`;
    const rawResult = raw(path);
    delete rawResult.ast.comments;
    const plugin = createPlugin(mdxParserName, jsParserName, transform);

    return await textToDoc(rawResult.text, {
      parser: mdxParserName,
      plugins: [...options.plugins, plugin],
      __mdx_parse_result: rawResult,
    });
  };

const printJsExpression = createPrint({
  jsParserName: "__js_expression",
  raw: (path) => path.node.data.estree.body[0].expression.raw,
  transform: transformJsExpression,
});

const printJsProgram = createPrint({
  jsParserName: "acorn",
  raw: (path) => path.node.data.estree.raw,
  transform: transformJsProgram,
});

export { printJsExpression, printJsProgram };
