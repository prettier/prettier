"use strict";

const util = require("./util");
const docUtils = require("./doc-utils");
const docBuilders = require("./doc-builders");
const comments = require("./comments");
const indent = docBuilders.indent;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const concat = docBuilders.concat;

function printSubtree(path, print, options) {
  switch (options.parser) {
    case "parse5":
      return fromHtmlParser2(path, print, options);
    case "babylon":
    case "flow":
    case "typescript":
      return fromBabylonFlowOrTypeScript(path, print, options);
    case "markdown":
      return fromMarkdown(path, print, options);
  }
}

function parseAndPrint(text, partialNextOptions, parentOptions) {
  const nextOptions = Object.assign({}, parentOptions, partialNextOptions, {
    parentParser: parentOptions.parser,
    trailingComma:
      partialNextOptions.parser === "json"
        ? "none"
        : partialNextOptions.trailingComma,
    originalText: text
  });
  const ast = require("./parser").parse(text, nextOptions);
  const astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, text, nextOptions);
  return require("./printer").printAstToDoc(ast, nextOptions);
}

function fromMarkdown(path, print, options) {
  const node = path.getValue();

  if (node.type === "code") {
    const parser = getParserName(node.lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = parseAndPrint(node.value, { parser }, options);
      return concat([style, node.lang, hardline, doc, style]);
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

function fromBabylonFlowOrTypeScript(path, print, options) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);

  switch (node.type) {
    case "TemplateLiteral": {
      const isCss = [isStyledJsx, isStyledComponents, isCssProp].some(isIt =>
        isIt(path)
      );

      if (isCss) {
        // Get full template literal with expressions replaced by placeholders
        const rawQuasis = node.quasis.map(q => q.value.raw);
        const text = rawQuasis.join("@prettier-placeholder");
        const doc = parseAndPrint(text, { parser: "css" }, options);
        return transformCssDoc(doc, path, print);
      }

      /*
       * react-relay and graphql-tag
       * graphql`...`
       * graphql.experimental`...`
       * gql`...`
       */
      if (
        parent &&
        ((parent.type === "TaggedTemplateExpression" &&
          ((parent.tag.type === "MemberExpression" &&
            parent.tag.object.name === "graphql" &&
            parent.tag.property.name === "experimental") ||
            (parent.tag.type === "Identifier" &&
              (parent.tag.name === "gql" || parent.tag.name === "graphql")))) ||
          (parent.type === "CallExpression" &&
            parent.callee.type === "Identifier" &&
            parent.callee.name === "graphql"))
      ) {
        const expressionDocs = node.expressions
          ? path.map(print, "expressions")
          : [];

        const numQuasis = node.quasis.length;

        if (numQuasis === 1 && node.quasis[0].value.raw.trim() === "") {
          return "``";
        }

        const parts = [];

        for (let i = 0; i < numQuasis; i++) {
          const templateElement = node.quasis[i];
          const isFirst = i === 0;
          const isLast = i === numQuasis - 1;
          const text = templateElement.value.raw;
          const lines = text.split("\n");
          const numLines = lines.length;
          const expressionDoc = expressionDocs[i];

          const startsWithBlankLine =
            numLines > 2 && lines[0].trim() === "" && lines[1].trim() === "";
          const endsWithBlankLine =
            numLines > 2 &&
            lines[numLines - 1].trim() === "" &&
            lines[numLines - 2].trim() === "";

          const commentsAndWhitespaceOnly = lines.every(line =>
            /^\s*(?:#[^\r\n]*)?$/.test(line)
          );

          // Bail out if an interpolation occurs within a comment.
          if (!isLast && /#[^\r\n]*$/.test(lines[numLines - 1])) {
            return null;
          }

          let doc = null;

          if (commentsAndWhitespaceOnly) {
            doc = printGraphqlComments(lines);
          } else {
            try {
              doc = stripTrailingHardline(
                parseAndPrint(text, { parser: "graphql" }, options)
              );
            } catch (_error) {
              // Bail if any part fails to parse.
              return null;
            }
          }

          if (doc) {
            if (!isFirst && startsWithBlankLine) {
              parts.push("");
            }
            parts.push(doc);
            if (!isLast && endsWithBlankLine) {
              parts.push("");
            }
          } else if (!isFirst && !isLast && startsWithBlankLine) {
            parts.push("");
          }

          if (expressionDoc) {
            parts.push(concat(["${", expressionDoc, "}"]));
          }
        }

        return concat([
          "`",
          indent(concat([hardline, join(hardline, parts)])),
          hardline,
          "`"
        ]);
      }

      break;
    }

    case "TemplateElement": {
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
        const doc = parseAndPrint(
          // leading whitespaces matter in markdown
          dedent(parent.quasis[0].value.cooked),
          {
            parser: "markdown",
            __inJsTemplate: true
          },
          options
        );
        return concat([
          indent(
            concat([softline, stripTrailingHardline(escapeBackticks(doc))])
          ),
          softline
        ]);
      }

      break;
    }
  }
}

function printGraphqlComments(lines) {
  const parts = [];
  let seenComment = false;

  lines.map(textLine => textLine.trim()).forEach((textLine, i, array) => {
    // Lines are either whitespace only, or a comment (with poential whitespace
    // around it). Drop whitespace-only lines.
    if (textLine === "") {
      return;
    }

    if (array[i - 1] === "" && seenComment) {
      // If a non-first comment is preceded by a blank (whitespace only) line,
      // add in a blank line.
      parts.push(concat([hardline, textLine]));
    } else {
      parts.push(textLine);
    }

    seenComment = true;
  });

  // If `lines` was whitespace only, return `null`.
  return parts.length === 0 ? null : join(hardline, parts);
}

function dedent(str) {
  const firstMatchedIndent = str.match(/\n^( *)/m);
  const spaces = firstMatchedIndent === null ? 0 : firstMatchedIndent[1].length;
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

function fromHtmlParser2(path, print, options) {
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
        const doc = parseAndPrint(getText(options, node), { parser }, options);
        return concat([hardline, doc]);
      }

      // Inline TypeScript
      if (
        parent.type === "script" &&
        (parent.attribs.type === "application/x-typescript" ||
          parent.attribs.lang === "ts")
      ) {
        const doc = parseAndPrint(
          getText(options, node),
          { parser: "typescript" },
          options
        );
        return concat([hardline, doc]);
      }

      // Inline Styles
      if (parent.type === "style") {
        const doc = parseAndPrint(
          getText(options, node),
          { parser: "css" },
          options
        );
        return concat([hardline, stripTrailingHardline(doc)]);
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
        const doc = parseAndPrint(
          node.value,
          {
            parser: parseJavaScriptExpression,
            // Use singleQuote since HTML attributes use double-quotes.
            // TODO(azz): We still need to do an entity escape on the attribute.
            singleQuote: true
          },
          options
        );
        return concat([
          node.key,
          '="',
          util.hasNewlineInRange(node.value, 0, node.value.length)
            ? doc
            : docUtils.removeLines(doc),
          '"'
        ]);
      }
    }
  }
}

function transformCssDoc(quasisDoc, path, print) {
  const parentNode = path.getValue();

  const isEmpty =
    parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();
  if (isEmpty) {
    return "``";
  }

  const expressionDocs = parentNode.expressions
    ? path.map(print, "expressions")
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

/**
 * JSX element with CSS prop
 */
function isCssProp(path) {
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    parentParent &&
    parent.type === "JSXExpressionContainer" &&
    parentParent.type === "JSXAttribute" &&
    parentParent.name.type === "JSXIdentifier" &&
    parentParent.name.name === "css"
  );
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

module.exports = {
  printSubtree
};
