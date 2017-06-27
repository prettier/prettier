"use strict";

const util = require("./util");
const docUtils = require("./doc-utils");
const docBuilders = require("./doc-builders");
const comments = require("./comments");
const indent = docBuilders.indent;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const concat = docBuilders.concat;

function printSubtree(subtreeParser, path, print, options) {
  const next = Object.assign({}, { transformDoc: doc => doc }, subtreeParser);
  next.options = Object.assign({}, options, next.options, {
    originalText: next.text
  });
  const ast = require("./parser").parse(next.text, next.options);
  const astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, next.text, next.options);
  const nextDoc = require("./printer").printAstToDoc(ast, next.options);
  return next.transformDoc(nextDoc, { path, print });
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
      const isCss = [isStyledJsx, isStyledComponents].some(isIt => isIt(path));

      if (isCss) {
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
       * react-relay and graphql-tag
       * graphql`...`
       * graphql.experimental`...`
       * gql`...`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
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
            concat([
              indent(concat([softline, stripTrailingHardline(doc)])),
              softline
            ]),
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

    case "attribute": {
      /*
       * Vue binding sytax: JS expressions
       * :class="{ 'some-key': value }"
       * v-bind:id="'list-' + id"
       * v-if="foo && !bar"
       * @click="someFunction()"
       */
      if (/(^@)|(^v-)|:/.test(node.key) && !/^\w+$/.test(node.value)) {
        return {
          text: node.value,
          options: {
            parser: parseJavaScriptExpression,
            // Use singleQuote since HTML attributes use double-quotes.
            // TODO(azz): We still need to do an entity escape on the attribute.
            singleQuote: true
          },
          transformDoc: doc => {
            return concat([
              node.key,
              '="',
              util.hasNewlineInRange(node.value, 0, node.value.length)
                ? doc
                : docUtils.removeLines(doc),
              '"'
            ]);
          }
        };
      }
    }
  }
}

function transformCssDoc(quasisDoc, parent) {
  const parentNode = parent.path.getValue();
  const expressionDocs = parentNode.expressions
    ? parent.path.map(parent.print, "expressions")
    : [];
  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat([
    "`",
    indent(concat([softline, stripTrailingHardline(newDoc)])),
    softline,
    "`"
  ]);
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  const expressions = expressionDocs.slice();
  const newDoc = docUtils.mapDoc(quasisDoc, doc => {
    if (!doc || !doc.parts || !doc.parts.length) {
      return doc;
    }
    let parts = doc.parts;
    if (
      parts.length > 1 &&
      parts[0] === "@" &&
      typeof parts[1] === "string" &&
      parts[1].startsWith("prettier-placeholder")
    ) {
      // If placeholder is split, join it
      const at = parts[0];
      const placeholder = parts[1];
      const rest = parts.slice(2);
      parts = [at + placeholder].concat(rest);
    }
    if (
      typeof parts[0] === "string" &&
      parts[0].startsWith("@prettier-placeholder")
    ) {
      const placeholder = parts[0];
      const rest = parts.slice(1);

      // When the expression has a suffix appended, like:
      // animation: linear ${time}s ease-out;
      const suffix = placeholder.slice("@prettier-placeholder".length);

      const expression = expressions.shift();
      parts = ["${", expression, "}" + suffix].concat(rest);
    }
    return Object.assign({}, doc, {
      parts: parts
    });
  });

  return expressions.length === 0 ? newDoc : null;
}

function parseJavaScriptExpression(text, parsers) {
  // Force parsing as an expression
  const ast = parsers.babylon(`(${text})`);
  // Extract expression from the declaration
  return {
    type: "File",
    program: ast.program.body[0].expression
  };
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
    // doc.parts[0].parts[1] === hardline :
    doc.parts[0].parts[1].type === "concat" &&
    doc.parts[0].parts[1].parts.length === 2 &&
    doc.parts[0].parts[1].parts[0].hard &&
    doc.parts[0].parts[1].parts[1].type === "break-parent"
  ) {
    return doc.parts[0].parts[0];
  }
  return doc;
}

/**
 * Template literal in this context:
 * <style jsx>{`div{color:red}`}</style>
 */
function isStyledJsx(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    parentParent &&
    node.quasis &&
    parent.type === "JSXExpressionContainer" &&
    parentParent.type === "JSXElement" &&
    parentParent.openingElement.name.name === "style" &&
    parentParent.openingElement.attributes.some(
      attribute => attribute.name.name === "jsx"
    )
  );
}

/**
 * Template literal in this context:
 * styled.button`color: red`
 * or
 * Foo.extend`color: red`
 */
function isStyledComponents(path) {
  const parent = path.getParentNode();
  return (
    parent &&
    parent.type === "TaggedTemplateExpression" &&
    parent.tag.type === "MemberExpression" &&
    (parent.tag.object.name === "styled" ||
      (/^[A-Z]/.test(parent.tag.object.name) &&
        parent.tag.property.name === "extend"))
  );
}

module.exports = {
  getSubtreeParser,
  printSubtree
};
