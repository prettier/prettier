import { preprocess as parseGlimmer } from "@glimmer/syntax";
import Handlebars from "handlebars";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "../language-handlebars/loc.js";

// Constructs that glimmer doesn't support and need to be replaced with placeholders
const UNSUPPORTED_BY_GLIMMER = new Set([
  "PartialStatement",
  // Add other unsupported constructs here as needed
]);

// Safe placeholder system to avoid collisions with user content
class SafePlaceholderSystem {
  constructor(originalText) {
    this.safePrefix = this.findSafePrefix(originalText);
    this.counter = 0;
    this.mapping = new Map();
  }

  findSafePrefix(text) {
    // Use lowercase to avoid HTML parser case issues
    const candidates = ["__hbs_", "__prettier_hbs_", "__prettier_handlebars_"];
    const safePrefix = candidates.find(
      (prefix) => !text.toLowerCase().includes(prefix.toLowerCase()),
    );

    if (safePrefix) {
      return safePrefix;
    }

    // If all candidates are found in text, create a unique one
    return `__hbs_${Math.random().toString(36).slice(2, 10)}_`;
  }

  createPlaceholder(expression) {
    const placeholder = `${this.safePrefix}${this.counter++}__`;
    this.mapping.set(placeholder, expression);
    return placeholder;
  }

  getExpression(placeholder) {
    return this.mapping.get(placeholder);
  }

  getAllPlaceholders() {
    return [...this.mapping.keys()];
  }
}

// Add location information to AST nodes
function addLocations(node, text) {
  if (!node || typeof node !== "object") {
    return;
  }

  // If the node has a loc property, compute offset-based locations
  if (node.loc) {
    node.loc.start.offset = getOffset(
      text,
      node.loc.start.line,
      node.loc.start.column,
    );
    node.loc.end.offset = getOffset(
      text,
      node.loc.end.line,
      node.loc.end.column,
    );
  }

  // Recursively process child nodes
  for (const key in node) {
    if (key === "loc" || key === "parent") {
      continue;
    }

    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) {
        addLocations(child, text);
      }
    } else if (value && typeof value === "object") {
      addLocations(value, text);
    }
  }
}

function getOffset(text, line, column) {
  const lines = text.split("\n");
  let offset = 0;

  for (let i = 0; i < line - 1; i++) {
    offset += lines[i].length + 1; // +1 for newline character
  }

  return offset + column;
}

function parse(text /*, options */) {
  let ast;
  try {
    // Step 1: Parse with handlebars to get all expressions
    const handlebarsAst = Handlebars.parse(text);
    addLocations(handlebarsAst, text);

    // Step 2: Create safe placeholder system
    const placeholderSystem = new SafePlaceholderSystem(text);

    // Step 3: Replace unsupported constructs with placeholders
    const { modifiedText, placeholderMap } = replaceUnsupportedConstructs(
      text,
      handlebarsAst,
      placeholderSystem,
    );

    // Step 4: Parse with glimmer
    const glimmerAst = parseGlimmer(modifiedText, {
      mode: "codemod",
      plugins: { ast: [glimmerPrettierParsePlugin] },
    });

    // Step 5: Merge the ASTs - restore the original unsupported constructs
    ast = mergeAsts(glimmerAst, placeholderMap);
  } catch (error) {
    const location = getErrorLocation(error, text);

    if (location) {
      const message = getErrorMessage(error);
      throw createError(message, { loc: location, cause: error });
    }

    /* c8 ignore next */
    throw error;
  }

  return ast;
}

function replaceUnsupportedConstructs(text, handlebarsAst, placeholderSystem) {
  let modifiedText = text;
  const placeholderMap = new Map();

  // Extract all unsupported expressions from the handlebars AST in reverse order
  // (reverse order to avoid offset issues when replacing)
  const unsupportedExpressions = [];

  function collectUnsupportedExpressions(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (
      UNSUPPORTED_BY_GLIMMER.has(node.type) &&
      node.loc &&
      node.loc.start.offset !== undefined &&
      node.loc.end.offset !== undefined
    ) {
      unsupportedExpressions.push({
        node,
        start: node.loc.start.offset,
        end: node.loc.end.offset,
      });
    }

    // Recursively collect from children
    for (const key in node) {
      if (key === "loc" || key === "parent") {
        continue;
      }

      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          collectUnsupportedExpressions(child);
        }
      } else if (value && typeof value === "object") {
        collectUnsupportedExpressions(value);
      }
    }
  }

  collectUnsupportedExpressions(handlebarsAst);

  // Sort by start position (reverse order for replacement)
  unsupportedExpressions.sort((a, b) => b.start - a.start);

  // Replace each unsupported expression with a placeholder
  for (const expr of unsupportedExpressions) {
    const placeholder = placeholderSystem.createPlaceholder(expr.node);
    placeholderMap.set(placeholder, expr.node);

    modifiedText =
      modifiedText.slice(0, expr.start) +
      placeholder +
      modifiedText.slice(expr.end);
  }

  return { modifiedText, placeholderMap };
}

function mergeAsts(glimmerAst, placeholderMap) {
  // For now, we'll just remove the placeholders entirely since
  // we're not adding printer support for partials yet
  // Walk through the glimmer AST and remove placeholder text nodes
  function removePlaceholders(node) {
    if (!node || typeof node !== "object") {
      return node;
    }

    // Handle text nodes - remove if they contain placeholders
    if (node.type === "TextNode" && node.chars) {
      // Check if this text node contains a placeholder
      for (const [placeholder] of placeholderMap.entries()) {
        if (node.chars === placeholder) {
          // Remove the entire text node (return null to be filtered out)
          return null;
        }
        if (node.chars.includes(placeholder)) {
          // For mixed content, remove the placeholder part
          let remainingText = node.chars;

          // Find all placeholders in this text and remove them
          for (const ph of placeholderMap.keys()) {
            remainingText = remainingText.replace(ph, "");
          }

          // If there's still content, keep it
          if (remainingText.trim()) {
            return {
              ...node,
              chars: remainingText,
            };
          }
          // If only placeholder content, remove the node
          return null;
        }
      }
    }

    // Recursively process child nodes
    const newNode = { ...node };

    if (Array.isArray(node.children)) {
      newNode.children = node.children.map(removePlaceholders).filter(Boolean);
    }

    if (Array.isArray(node.body)) {
      newNode.body = node.body.map(removePlaceholders).filter(Boolean);
    }

    return newNode;
  }

  const result = removePlaceholders(glimmerAst);
  return result;
}

function getErrorMessage(error) {
  const { message } = error;

  // Extract meaningful error message from handlebars or glimmer
  if (message.includes("Parse error on line")) {
    return message.split("\n")[0];
  }

  // Handle glimmer errors (similar to existing glimmer parser)
  const lines = message.split("\n");
  if (
    lines.length >= 4 &&
    /^Parse error on line \d+:$/u.test(lines[0]) &&
    /^-*\^$/u.test(lines.at(-2))
  ) {
    return lines.at(-1);
  }

  return message;
}

function getErrorLocation(error, text) {
  const { message, location, hash } = error;

  // Handle glimmer-style errors
  if (location) {
    const { start, end } = location;
    if (typeof end.line !== "number") {
      return { start };
    }
    return location;
  }

  if (hash) {
    const {
      loc: { last_line, last_column },
    } = hash;
    return { start: { line: last_line, column: last_column + 1 } };
  }

  // Parse location from handlebars error message
  const lineMatch = message.match(/line (\d+)/u);
  const columnMatch = message.match(/column (\d+)/u);

  if (lineMatch) {
    const line = Number.parseInt(lineMatch[1], 10);
    const column = columnMatch ? Number.parseInt(columnMatch[1], 10) : 0;

    return {
      start: {
        line,
        column,
        offset: getOffset(text, line, column),
      },
    };
  }

  return null;
}

// Glimmer parser plugin (reused from existing glimmer parser)
const isIndex = (value) => Number.isInteger(value) && value >= 0;

// Add `offset` to `loc.{start,end}`
const setOffset = (node) => {
  const { start, end } = node.loc;

  start.offset = node.loc.getStart().offset;
  end.offset = node.loc.getEnd().offset;

  /* c8 ignore next 6 */
  if (
    process.env.NODE_ENV !== "production" &&
    (!isIndex(start.offset) || !isIndex(end.offset))
  ) {
    throw new TypeError("Can't not locate node.");
  }
};

// Add backslash handling for escaped mustaches
function addBackslash(node) {
  const childrenOrBody = node.children ?? node.body;
  if (childrenOrBody) {
    for (let i = 0; i < childrenOrBody.length - 1; i++) {
      if (
        childrenOrBody[i].type === "TextNode" &&
        childrenOrBody[i + 1].type === "MustacheStatement"
      ) {
        childrenOrBody[i].chars = childrenOrBody[i].chars.replace(
          /\\$/u,
          "\\\\",
        );
      }
    }
  }
}

const glimmerPrettierParsePlugin = (/* options*/) => ({
  name: "glimmerPrettierParsePlugin",
  visitor: {
    All(node) {
      setOffset(node);
      addBackslash(node);
    },
  },
});

export const hbs = {
  parse,
  astFormat: "glimmer", // Use glimmer format since that's what the result will be
  locStart,
  locEnd,
};
