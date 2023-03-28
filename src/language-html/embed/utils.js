import { group, indent, softline } from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";

function printExpand(doc, canHaveTrailingWhitespace = true) {
  return [indent([softline, doc]), canHaveTrailingWhitespace ? softline : ""];
}

function printMaybeHug(doc, shouldHug) {
  return shouldHug ? group(doc) : printExpand(doc);
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

async function formatJsAttribute(code, options, textToDoc, shouldHug) {
  options = {
    // strictly prefer single quote to avoid unnecessary html entity escape
    __isInHtmlAttribute: true,
    __embeddedInHtml: true,
    ...options,
  };

  if (shouldHug === undefined) {
    options.__onHtmlBindingRoot = (ast, options) => {
      shouldHug = shouldHugJsExpression(ast, options);
    };
  }

  const doc = await textToDoc(code, options, textToDoc);

  return printMaybeHug(doc, shouldHug);
}


export {
  printExpand,
  printMaybeHug,
  formatJsAttribute,
};
