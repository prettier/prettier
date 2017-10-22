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
    case "markdown":
      return fromMarkdown(path, options);
  }
}

function fromMarkdown(path, options) {
  const node = path.getValue();

  if (node.type === "code") {
    const parser = getParserName(node.lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      return {
        options: { parser },
        transformDoc: doc => concat([style, node.lang, hardline, doc, style]),
        text: node.value
      };
    }
  }

  return null;

  function getParserName(lang) {
    switch (lang) {
      case "js":
      case "jsx":
      case "javascript":
        return "babylon";
      case "ts":
      case "tsx":
      case "typescript":
        return "typescript";
      case "gql":
      case "graphql":
        return "graphql";
      case "css":
        return "css";
      case "less":
        return "less";
      case "scss":
        return "scss";
      case "json":
      case "json5":
        return "json";
      case "md":
      case "markdown":
        return "markdown";
      default:
        return null;
    }
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
          options: { parser: "css" },
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
        // We currently don't support expression inside GraphQL template literals
        parent.expressions.length === 0 &&
        parentParent &&
        ((parentParent.type === "TaggedTemplateExpression" &&
          ((parentParent.tag.type === "MemberExpression" &&
            parentParent.tag.object.name === "graphql" &&
            parentParent.tag.property.name === "experimental") ||
            (parentParent.tag.type === "Identifier" &&
              (parentParent.tag.name === "gql" ||
                parentParent.tag.name === "graphql")))) ||
          (parentParent.type === "CallExpression" &&
            parentParent.callee.type === "Identifier" &&
            parentParent.callee.name === "graphql"))
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

      /**
       * md`...`
       * markdown`...`
       */
      if (
        parentParent &&
        (parentParent.type === "TaggedTemplateExpression" &&
          parent.quasis.length === 1 &&
          (parentParent.tag.type === "Identifier" &&
            (parentParent.tag.name === "md" ||
              parentParent.tag.name === "markdown")))
      ) {
        return {
          options: { parser: "markdown", __inJsTemplate: true },
          transformDoc: doc =>
            concat([
              indent(
                concat([softline, stripTrailingHardline(escapeBackticks(doc))])
              ),
              softline
            ]),
          // leading whitespaces matter in markdown
          text: dedent(parent.quasis[0].value.cooked)
        };
      }

      break;
    }
  }
}

function dedent(str) {
  const spaces = str.match(/\n^( *)/m)[1].length;
  return str.replace(new RegExp(`^ {${spaces}}`, "gm"), "").trim();
}

function escapeBackticks(doc) {
  return util.mapDoc(doc, currentDoc => {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    const parts = [];

    currentDoc.parts.forEach(part => {
      if (typeof part === "string") {
        parts.push(part.replace(/`/g, "\\`"));
      } else {
        parts.push(part);
      }
    });

    return Object.assign({}, currentDoc, { parts });
  });
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
          options: { parser: "css" },
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

  const isEmpty =
    parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();
  if (isEmpty) {
    return "``";
  }

  const expressionDocs = parentNode.expressions
    ? parent.path.map(parent.print, "expressions")
    : [];
  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* istanbul ignore if */
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat([
    "`",
    indent(concat([hardline, stripTrailingHardline(newDoc)])),
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
 * styled-components template literals
 */
function isStyledComponents(path) {
  const parent = path.getParentNode();

  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  const tag = parent.tag;

  switch (tag.type) {
    case "MemberExpression":
      return (
        // styled.foo``
        isStyledIdentifier(tag.object) ||
        // Component.extend``
        (/^[A-Z]/.test(tag.object.name) && tag.property.name === "extend")
      );

    case "CallExpression":
      return (
        // styled(Component)``
        isStyledIdentifier(tag.callee) ||
        (tag.callee.type === "MemberExpression" &&
          // styled.foo.attr({})``
          ((tag.callee.object.type === "MemberExpression" &&
            isStyledIdentifier(tag.callee.object.object)) ||
            // styled(Component).attr({})``
            (tag.callee.object.type === "CallExpression" &&
              isStyledIdentifier(tag.callee.object.callee))))
      );

    case "Identifier":
      // css``
      return tag.name === "css";

    default:
      return false;
  }
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

module.exports = {
  getSubtreeParser,
  printSubtree
};
