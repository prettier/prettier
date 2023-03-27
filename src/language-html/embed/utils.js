import { group, indent, softline } from "../../document/builders.js";

function printExpand(doc, canHaveTrailingWhitespace = true) {
  return group([
    indent([softline, doc]),
    canHaveTrailingWhitespace ? softline : "",
  ]);
}

function printMaybeHug(doc, shouldHug) {
  return shouldHug ? group(doc) : printExpand(doc);
}

function shouldHugAttribute(ast, options) {
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

function printAttributeValue(code, options, textToDoc) {
  return formatAttributeValue(code, options, textToDoc)
}

function formatAttributeValue(code, options, textToDoc) {
  options = {
    // strictly prefer single quote to avoid unnecessary html entity escape
    __isInHtmlAttribute: true,
    __embeddedInHtml: true,
    ...options,
  };

  return textToDoc(code, options);

}

export { shouldHugAttribute, printExpand, printMaybeHug, printAttributeValue, formatAttributeValue };
