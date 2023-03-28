import { group, indent, softline } from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";

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

async function printAttributeValue(code, options, textToDoc) {
  let shouldHug = false;

  const doc = await formatAttributeValue(
    code,
    {
      __onHtmlBindingRoot(ast, options) {
        shouldHug = shouldHugAttribute(ast, options);
      },
      ...options,
    },
    textToDoc
  );

  return printMaybeHug(doc, shouldHug);
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

function printAttributeDoc(path, valueDoc) {
  return valueDoc
    ? [
        path.node.rawName,
        '="',
        group(
          mapDoc(valueDoc, (doc) =>
            typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
          )
        ),
        '"',
      ]
    : undefined;
}

function printAttribute(path, valueDoc) {
  if (!valueDoc) {
    return;
  }

  return [
    path.node.rawName,
    '="',
    group(
      mapDoc(valueDoc, (doc) =>
        typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
      )
    ),
    '"',
  ];
}

export {
  shouldHugAttribute,
  printExpand,
  printMaybeHug,
  printAttributeValue,
  formatAttributeValue,
  printAttributeDoc,
  printAttribute,
};
