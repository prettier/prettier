"use strict";

const Placeholder = require("id-placeholder");
const { isBlockComment, hasLeadingComment } = require("./comments");

const {
  builders: {
    indent,
    join,
    hardline,
    softline,
    literalline,
    concat,
    group,
    dedentToRoot
  },
  utils: { mapDoc, stripTrailingHardline }
} = require("../doc");

const cssPlaceholder = new Placeholder("prettier");
const CSS_PROPERTY_PLACEHOLDER = new Placeholder("prettier").get(0);
const CSS_PRETTIER_IGNORE_PLACEHOLDER = new Placeholder("prettier").get(0);
const CSS_EXTRA_SEMICOLON_MARK = new Placeholder("prettier").get(0);
const placeholderPiecesToStringArray = pieces =>
  pieces.map(({ isPlaceholder, string, placeholder }) =>
    isPlaceholder ? placeholder : string
  );
const removeCSSComments = string =>
  string
    .replace(/\/\*\s*prettier-ignore\s*\*\//g, CSS_PRETTIER_IGNORE_PLACEHOLDER)
    .replace(/\/\/\s*prettier-ignore/g, CSS_PRETTIER_IGNORE_PLACEHOLDER)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(
      new RegExp(CSS_PRETTIER_IGNORE_PLACEHOLDER, "g"),
      "/* prettier-ignore */"
    );
const cssIdentityRegExp = /[^$a-zA-Z\d_-]/;
const findCSSIdentity = (string, fromEnd) => {
  const arrayMethod = fromEnd ? "pop" : "shift";
  const piece = cssPlaceholder.parse(string)[arrayMethod]();

  if (!piece || piece.isPlaceholder) {
    return;
  }

  return piece.string.split(cssIdentityRegExp)[arrayMethod]();
};
function embed(path, print, textToDoc, options) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);

  switch (node.type) {
    case "TemplateLiteral": {
      const isCss = [
        isStyledJsx,
        isStyledComponents,
        isCssProp,
        isAngularComponentStyles
      ].some(isIt => isIt(path));

      if (isCss) {
        // Get full template literal with expressions replaced by placeholders
        const text = node.quasis.reduce((prevVal, current, index) => {
          const raw = current.value.raw;
          return index === 0
            ? raw
            : prevVal + cssPlaceholder.get(index - 1) + raw;
        }, "");

        // css parser can't handle the following css
        // ```css
        // div {
        //   css-placeholder;
        // }
        // ```
        // so we fake it into
        // ```css
        // div {
        //   prop-placeholder: css-placeholder;
        // }
        // ```
        // and will restore back after parse

        const pieces = cssPlaceholder.parse(text);
        const texts = placeholderPiecesToStringArray(pieces);

        pieces.forEach(({ isPlaceholder, placeholder }, index) => {
          if (!isPlaceholder) {
            return;
          }

          let text = placeholder;
          let before = texts.slice(0, index).join();
          let after = texts.slice(index + 1).join();

          // move identity character
          const leadingIdentity = findCSSIdentity(before, true);
          const tailingIdentity = findCSSIdentity(after);
          if (leadingIdentity) {
            texts[index - 1] = texts[index - 1].slice(
              0,
              -leadingIdentity.length
            );
            text = leadingIdentity + text;
          }
          if (tailingIdentity) {
            texts[index + 1] = texts[index + 1].slice(tailingIdentity.length);
            text += tailingIdentity;
          }

          // check orphan placeholder
          after = removeCSSComments(
            texts
              .slice(index + 1)
              .filter(text => !cssPlaceholder.isPlaceholder(text))
              .join("")
          );
          const endsWithLineBreak = /^\s*\n/.test(after);
          after = after.trim();

          const needExtraSemi =
            !after ||
            endsWithLineBreak ||
            after[0] !== ";" ||
            cssPlaceholder.isPlaceholder(
              texts.slice(index + 1).filter(text => text.trim())[0] || ""
            );

          before = removeCSSComments(texts.slice(0, index).join("")).trim();

          if (
            (!after ||
              endsWithLineBreak ||
              after[0] === ";" ||
              after[0] === "}") &&
            (!before ||
              before.slice(-1) === ";" ||
              before.slice(-1) === "{" ||
              before.slice(-1) === "}")
          ) {
            text = `${CSS_PROPERTY_PLACEHOLDER}: ${text}`;

            if (needExtraSemi) {
              text += `${CSS_EXTRA_SEMICOLON_MARK};`;
            }
          }

          texts[index] = text;
        });

        const doc = textToDoc(texts.join(""), { parser: "css" });
        return transformCssDoc(doc, path, print);
      }

      /*
       * react-relay and graphql-tag
       * graphql`...`
       * graphql.experimental`...`
       * gql`...`
       *
       * This intentionally excludes Relay Classic tags, as Prettier does not
       * support Relay Classic formatting.
       */
      if (isGraphQL(path)) {
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
          const text = templateElement.value.cooked;

          // Bail out if any of the quasis have an invalid escape sequence
          // (which would make the `cooked` value be `null` or `undefined`)
          if (typeof text !== "string") {
            return null;
          }

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
            doc = stripTrailingHardline(textToDoc(text, { parser: "graphql" }));
          }

          if (doc) {
            doc = escapeTemplateCharacters(doc, false);
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

      const htmlParser = isHtml(path)
        ? "html"
        : isAngularComponentTemplate(path)
        ? "angular"
        : undefined;

      if (htmlParser) {
        return printHtmlTemplateLiteral(
          path,
          print,
          textToDoc,
          htmlParser,
          options.embeddedInHtml
        );
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
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        parentParent.tag.type === "Identifier" &&
        (parentParent.tag.name === "md" || parentParent.tag.name === "markdown")
      ) {
        const text = parent.quasis[0].value.raw.replace(
          /((?:\\\\)*)\\`/g,
          (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
        );
        const indentation = getIndentation(text);
        const hasIndent = indentation !== "";
        return concat([
          hasIndent
            ? indent(
                concat([
                  softline,
                  printMarkdown(
                    text.replace(new RegExp(`^${indentation}`, "gm"), "")
                  )
                ])
              )
            : concat([literalline, dedentToRoot(printMarkdown(text))]),
          softline
        ]);
      }

      break;
    }
  }

  function printMarkdown(text) {
    const doc = textToDoc(text, { parser: "markdown", __inJsTemplate: true });
    return stripTrailingHardline(escapeTemplateCharacters(doc, true));
  }
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

function uncook(cookedValue) {
  return cookedValue.replace(/([\\`]|\$\{)/g, "\\$1");
}

function escapeTemplateCharacters(doc, raw) {
  return mapDoc(doc, currentDoc => {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    const parts = [];

    currentDoc.parts.forEach(part => {
      if (typeof part === "string") {
        parts.push(raw ? part.replace(/(\\*)`/g, "$1$1\\`") : uncook(part));
      } else {
        parts.push(part);
      }
    });

    return Object.assign({}, currentDoc, { parts });
  });
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
const CSS_EXTRA_SEMICOLON_MARK_LENGTH = CSS_EXTRA_SEMICOLON_MARK.length;
const endsWithCSSSemicolonMark = string =>
  string.slice(-CSS_EXTRA_SEMICOLON_MARK_LENGTH) === CSS_EXTRA_SEMICOLON_MARK;
const hasCSSPlaceholder = doc => {
  if (!doc || !doc.parts) {
    return false;
  }
  const text = doc.parts.filter(part => typeof part === "string").join();
  return (
    [CSS_PROPERTY_PLACEHOLDER, CSS_EXTRA_SEMICOLON_MARK].some(
      placeholder => text.indexOf(placeholder) !== -1
    ) || cssPlaceholder.hasPlaceholder(text)
  );
};
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  const replacedExpressions = [];
  const restoredDoc = mapDoc(quasisDoc, doc => {
    if (!hasCSSPlaceholder(doc)) {
      return doc;
    }

    const parts = doc.parts.slice().reduce((parts, part, index, original) => {
      if (typeof part !== "string") {
        parts.push(part);
        return parts;
      }

      // clean extra semicolon mark
      if (endsWithCSSSemicolonMark(part)) {
        part = part.slice(0, -CSS_EXTRA_SEMICOLON_MARK_LENGTH);
        original[index] = part;

        // find following semicolon
        let semicolonIndex = -1;
        for (let i = index + 1; i < original.length; i++) {
          const value = original[i];
          if (typeof value !== "string" || !value.trim()) {
            continue;
          }
          if (value !== ";") {
            throw new Error(
              "CSS_EXTRA_SEMICOLON_MARK should always follow with a semicolon"
            );
          }
          semicolonIndex = i;
          break;
        }
        original[semicolonIndex] = "";
      }
      part = part.replace(new RegExp(CSS_EXTRA_SEMICOLON_MARK + ";", "g"), "");

      // clean css prop placeholder
      if (part === CSS_PROPERTY_PLACEHOLDER) {
        if (original[index + 1] !== ":") {
          throw new Error(
            "CSS_PROPERTY_PLACEHOLDER should always follow with a colon"
          );
        }
        original[index] = "";
        original[index + 1] = "";

        // clean up following spaces
        for (let i = index + 2; i < original.length; i++) {
          const value = original[i];
          if (typeof value !== "string" || value.trim()) {
            break;
          }
          original[i] = "";
        }
        return parts;
      }
      part = part.replace(new RegExp(CSS_PROPERTY_PLACEHOLDER + ":", "g"), "");

      // replace placeholders
      return cssPlaceholder
        .parse(part)
        .reduce((parts, { isPlaceholder, string, index }) => {
          if (!isPlaceholder) {
            parts.push(string);
            return parts;
          }

          if (replacedExpressions.indexOf(index) === -1) {
            replacedExpressions.push(index);
          }

          parts.push("${");
          parts.push(expressionDocs[index]);
          parts.push("}");

          return parts;
        }, parts);
    }, []);

    return Object.assign({}, doc, {
      parts: parts
    });
  });

  if (expressionDocs.length === replacedExpressions.length) {
    return restoredDoc;
  }
}

function printGraphqlComments(lines) {
  const parts = [];
  let seenComment = false;

  lines
    .map(textLine => textLine.trim())
    .forEach((textLine, i, array) => {
      // Lines are either whitespace only, or a comment (with potential whitespace
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

/**
 * Template literal in these contexts:
 * <style jsx>{`div{color:red}`}</style>
 * css``
 * css.global``
 * css.resolve``
 */
function isStyledJsx(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    (parentParent &&
      node.quasis &&
      parent.type === "JSXExpressionContainer" &&
      parentParent.type === "JSXElement" &&
      parentParent.openingElement.name.name === "style" &&
      parentParent.openingElement.attributes.some(
        attribute => attribute.name.name === "jsx"
      )) ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "Identifier" &&
      parent.tag.name === "css") ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "MemberExpression" &&
      parent.tag.object.name === "css" &&
      (parent.tag.property.name === "global" ||
        parent.tag.property.name === "resolve"))
  );
}

/**
 * Angular Components can have:
 * - Inline HTML template
 * - Inline CSS styles
 *
 * ...which are both within template literals somewhere
 * inside of the Component decorator factory.
 *
 * E.g.
 * @Component({
 *  template: `<div>...</div>`,
 *  styles: [`h1 { color: blue; }`]
 * })
 */
function isAngularComponentStyles(path) {
  return isPathMatch(
    path,
    [
      node => node.type === "TemplateLiteral",
      (node, name) => node.type === "ArrayExpression" && name === "elements",
      (node, name) =>
        node.type === "Property" &&
        node.key.type === "Identifier" &&
        node.key.name === "styles" &&
        name === "value"
    ].concat(getAngularComponentObjectExpressionPredicates())
  );
}
function isAngularComponentTemplate(path) {
  return isPathMatch(
    path,
    [
      node => node.type === "TemplateLiteral",
      (node, name) =>
        node.type === "Property" &&
        node.key.type === "Identifier" &&
        node.key.name === "template" &&
        name === "value"
    ].concat(getAngularComponentObjectExpressionPredicates())
  );
}
function getAngularComponentObjectExpressionPredicates() {
  return [
    (node, name) => node.type === "ObjectExpression" && name === "properties",
    (node, name) =>
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "Component" &&
      name === "arguments",
    (node, name) => node.type === "Decorator" && name === "expression"
  ];
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
        isStyledExtend(tag)
      );

    case "CallExpression":
      return (
        // styled(Component)``
        isStyledIdentifier(tag.callee) ||
        (tag.callee.type === "MemberExpression" &&
          ((tag.callee.object.type === "MemberExpression" &&
            // styled.foo.attrs({})``
            (isStyledIdentifier(tag.callee.object.object) ||
              // Component.extend.attrs({})``
              isStyledExtend(tag.callee.object))) ||
            // styled(Component).attrs({})``
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

function isStyledExtend(node) {
  return /^[A-Z]/.test(node.object.name) && node.property.name === "extend";
}

/*
 * react-relay and graphql-tag
 * graphql`...`
 * graphql.experimental`...`
 * gql`...`
 * GraphQL comment block
 *
 * This intentionally excludes Relay Classic tags, as Prettier does not
 * support Relay Classic formatting.
 */
function isGraphQL(path) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    hasLanguageComment(node, "GraphQL") ||
    (parent &&
      ((parent.type === "TaggedTemplateExpression" &&
        ((parent.tag.type === "MemberExpression" &&
          parent.tag.object.name === "graphql" &&
          parent.tag.property.name === "experimental") ||
          (parent.tag.type === "Identifier" &&
            (parent.tag.name === "gql" || parent.tag.name === "graphql")))) ||
        (parent.type === "CallExpression" &&
          parent.callee.type === "Identifier" &&
          parent.callee.name === "graphql")))
  );
}

function hasLanguageComment(node, languageName) {
  // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js
  return hasLeadingComment(
    node,
    comment => isBlockComment(comment) && comment.value === ` ${languageName} `
  );
}

function isPathMatch(path, predicateStack) {
  const stack = path.stack.slice();

  let name = null;
  let node = stack.pop();

  for (const predicate of predicateStack) {
    if (node === undefined) {
      return false;
    }

    // skip index/array
    if (typeof name === "number") {
      name = stack.pop();
      node = stack.pop();
    }

    if (!predicate(node, name)) {
      return false;
    }

    name = stack.pop();
    node = stack.pop();
  }

  return true;
}

/**
 *     - html`...`
 *     - HTML comment block
 */
function isHtml(path) {
  const node = path.getValue();
  return (
    hasLanguageComment(node, "HTML") ||
    isPathMatch(path, [
      node => node.type === "TemplateLiteral",
      (node, name) =>
        node.type === "TaggedTemplateExpression" &&
        node.tag.type === "Identifier" &&
        node.tag.name === "html" &&
        name === "quasi"
    ])
  );
}

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;

function printHtmlTemplateLiteral(
  path,
  print,
  textToDoc,
  parser,
  escapeClosingScriptTag
) {
  const node = path.getValue();

  const counter = htmlTemplateLiteralCounter;
  htmlTemplateLiteralCounter = (htmlTemplateLiteralCounter + 1) >>> 0;

  const composePlaceholder = index =>
    `PRETTIER_HTML_PLACEHOLDER_${index}_${counter}_IN_JS`;

  const text = node.quasis
    .map((quasi, index, quasis) =>
      index === quasis.length - 1
        ? quasi.value.cooked
        : quasi.value.cooked + composePlaceholder(index)
    )
    .join("");

  const expressionDocs = path.map(print, "expressions");

  if (expressionDocs.length === 0 && text.trim().length === 0) {
    return "``";
  }

  const placeholderRegex = RegExp(composePlaceholder("(\\d+)"), "g");

  const contentDoc = mapDoc(
    stripTrailingHardline(textToDoc(text, { parser })),
    doc => {
      if (typeof doc !== "string") {
        return doc;
      }

      const parts = [];

      const components = doc.split(placeholderRegex);
      for (let i = 0; i < components.length; i++) {
        let component = components[i];

        if (i % 2 === 0) {
          if (component) {
            component = uncook(component);
            if (escapeClosingScriptTag) {
              component = component.replace(/<\/(script)\b/gi, "<\\/$1");
            }
            parts.push(component);
          }
          continue;
        }

        const placeholderIndex = +component;
        parts.push(
          concat(["${", group(expressionDocs[placeholderIndex]), "}"])
        );
      }

      return concat(parts);
    }
  );

  return group(
    concat(["`", indent(concat([hardline, group(contentDoc)])), softline, "`"])
  );
}

module.exports = embed;
