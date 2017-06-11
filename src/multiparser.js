"use strict";

const util = require("./util");
const { traverseDoc } = require("./doc-utils");
const docBuilders = require("./doc-builders");
const indent = docBuilders.indent;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const concat = docBuilders.concat;

function printSubtree(subtreeParser, options, expressionDocs) {
  const next = Object.assign({}, { transformDoc: doc => doc }, subtreeParser);
  next.options = Object.assign({}, options, next.options);
  const ast = require("./parser").parse(next.text, next.options);
  const nextDoc = require("./printer").printAstToDoc(ast, next.options);
  return next.transformDoc(nextDoc, expressionDocs);
}

/**
 * @returns {{ text, options?, transformDoc? } | void}
 */
function getSubtreeParser(path, options) {
  switch (options.parser) {
    case "parse5":
      return fromHtmlParser2(path, options);
    case "babylon":
    case "flow":
    case "typescript":
      return fromBabylonFlowOrTypeScript(path, options);
  }
}

function fromBabylonFlowOrTypeScript(path) {
  const node = path.getValue();

  switch (node.type) {
    case "TemplateLiteral": {
      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);

      /*
       * styled-jsx:
       * ```jsx
       * <style jsx>{`div{color:red}`}</style>
       * ```
       */
      if (
        parentParent &&
        node.quasis &&
        parent.type === "JSXExpressionContainer" &&
        parentParent.type === "JSXElement" &&
        parentParent.openingElement.name.name === "style" &&
        parentParent.openingElement.attributes.some(
          attribute => attribute.name.name === "jsx"
        )
      ) {
        // Get full template literal with expressions replaced by placeholders
        const rawQuasis = node.quasis.map(q => q.value.raw);
        const text = rawQuasis.join("@prettier-placeholder");

        return {
          options: { parser: "postcss" },
          transformDoc: transformCssDoc,
          text: text
        };
      }
      break;
    }
    case "TemplateElement": {
      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);

      /*
       * styled-components:
       * styled.button`color: red`
       * Foo.extend`color: red`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        parentParent.tag.type === "MemberExpression" &&
        (parentParent.tag.object.name === "styled" ||
          (/^[A-Z]/.test(parentParent.tag.object.name) &&
            parentParent.tag.property.name === "extend"))
      ) {
        return {
          options: { parser: "postcss" },
          transformDoc: doc =>
            concat([
              indent(concat([softline, stripTrailingHardline(doc)])),
              softline
            ]),
          text: parent.quasis[0].value.raw
        };
      }

      /*
       * react-relay and graphql-tag
       * graphql`...`
       * graphql.experimental`...`
       * gql`...`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        // ((parentParent.tag.type === "MemberExpression" &&
        //   parentParent.tag.object.name === "Relay" &&
        //   parentParent.tag.property.name === "QL") ||
        ((parentParent.tag.type === "MemberExpression" &&
          parentParent.tag.object.name === "graphql" &&
          parentParent.tag.property.name === "experimental") ||
          (parentParent.tag.type === "Identifier" &&
            (parentParent.tag.name === "gql" ||
              parentParent.tag.name === "graphql")))
      ) {
        return {
          options: { parser: "graphql" },
          transformDoc: doc =>
            concat([indent(concat([softline, doc])), softline]),
          text: parent.quasis[0].value.raw
        };
      }

      break;
    }
  }
}

function fromHtmlParser2(path, options) {
  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const parent = path.getParentNode();
      // Inline JavaScript
      if (
        parent.type === "script" &&
        ((!parent.attribs.lang && !parent.attribs.lang) ||
          parent.attribs.type === "text/javascript" ||
          parent.attribs.type === "application/javascript")
      ) {
        const parser = options.parser === "flow" ? "flow" : "babylon";
        return {
          options: { parser },
          transformDoc: doc => concat([hardline, doc]),
          text: getText(options, node)
        };
      }

      // Inline TypeScript
      if (
        parent.type === "script" &&
        (parent.attribs.type === "application/x-typescript" ||
          parent.attribs.lang === "ts")
      ) {
        return {
          options: { parser: "typescript" },
          transformDoc: doc => concat([hardline, doc]),
          text: getText(options, node)
        };
      }

      // Inline Styles
      if (parent.type === "style") {
        return {
          options: { parser: "postcss" },
          transformDoc: doc => concat([hardline, stripTrailingHardline(doc)]),
          text: getText(options, node)
        };
      }

      break;
    }
  }
}

function transformCssDoc(quasisDoc, expressionDocs) {
  const allReplaced = replacePlaceholders(quasisDoc, expressionDocs);
  if (!allReplaced) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat([
    "`",
    indent(concat([softline, stripTrailingHardline(quasisDoc)])),
    softline,
    "`"
  ]);
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns true if all the expressions were replaced, false otherwise
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return true;
  }
  const expressions = expressionDocs.slice();
  traverseDoc(quasisDoc, doc => {
    if (!doc || !doc.parts || !doc.parts.length) {
      // Recurse
      return true;
    }
    if (
      doc.parts.length > 1 &&
      doc.parts[0] === "@" &&
      typeof doc.parts[1] === "string" &&
      doc.parts[1].startsWith("prettier-placeholder")
    ) {
      // If placeholder is splitted, join it
      const [at, placeholder, ...rest] = doc.parts;
      doc.parts = [at + placeholder, ...rest];
    }
    if (
      typeof doc.parts[0] === "string" &&
      doc.parts[0].startsWith("@prettier-placeholder")
    ) {
      const expression = expressions.shift();
      const [placeholder, ...rest] = doc.parts;

      // When the expression has a suffix appended, like:
      // animation: linear ${time}s ease-out;
      const suffix = placeholder.slice("@prettier-placeholder".length);

      doc.parts = ["${", expression, "}" + suffix, ...rest];
      const recurse = expressions.length > 0;
      return recurse;
    }
  });

  return expressions.length === 0;
}

function getText(options, node) {
  return options.originalText.slice(util.locStart(node), util.locEnd(node));
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  if (
    doc.type === "concat" &&
    doc.parts[0].type === "concat" &&
    doc.parts[0].parts.length === 2 &&
    doc.parts[0].parts[1] === hardline
  ) {
    return doc.parts[0].parts[0];
  }
  return doc;
}

module.exports = {
  getSubtreeParser,
  printSubtree
};
