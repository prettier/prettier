import { group, indent, softline } from "../../document/builders.js";

/**
 * @import {Doc} from "../../document/builders.js"
 */

function printExpand(doc, canHaveTrailingWhitespace = true) {
  return [indent([softline, doc]), canHaveTrailingWhitespace ? softline : ""];
}

function shouldHugJsExpression(ast, options) {
  const rootNode =
    ast.type === "NGRoot"
      ? ast.node.type === "NGMicrosyntax" &&
        ast.node.body.length === 1 &&
        ast.node.body[0].type === "NGMicrosyntaxExpression"
        ? ast.node.body[0].expression
        : ast.node
      : ast.type === "JsExpressionRoot"
        ? ast.node
        : ast;
  return (
    rootNode &&
    (rootNode.type === "ObjectExpression" ||
      rootNode.type === "ArrayExpression" ||
      ((options.parser === "__vue_expression" ||
        options.parser === "__vue_ts_expression") &&
        (rootNode.type === "TemplateLiteral" ||
          rootNode.type === "StringLiteral")))
  );
}

/**
 * @param {string} code
 * @param {Function} textToDoc
 * @param {*} options
 * @param {(ast: any, options: any) => boolean} [shouldHugJsExpression]
 * @returns {Promise<Doc>}
 */
async function formatAttributeValue(
  code,
  textToDoc,
  options,
  shouldHugJsExpression,
) {
  options = {
    // strictly prefer single quote to avoid unnecessary html entity escape
    __isInHtmlAttribute: true,
    __embeddedInHtml: true,
    ...options,
  };

  let shouldHug = true;
  if (shouldHugJsExpression) {
    options.__onHtmlBindingRoot = (ast, options) => {
      shouldHug = shouldHugJsExpression(ast, options);
    };
  }

  const doc = await textToDoc(code, options, textToDoc);

  return shouldHug ? group(doc) : printExpand(doc);
}

export { formatAttributeValue, printExpand, shouldHugJsExpression };
