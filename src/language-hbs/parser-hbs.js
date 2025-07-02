import { preprocess as parseGlimmer } from "@glimmer/syntax";
import Handlebars from "handlebars";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "../language-handlebars/loc.js";

// Constructs that glimmer doesn't support and need to be replaced with placeholders
const UNSUPPORTED_BY_GLIMMER = new Set([
  "PartialStatement",
  "PartialBlockStatement",
  "DecoratorBlock",
  "Decorator", // Standalone decorators like {{* decorator}}
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
  // Add prefix to distinguish Handlebars AST nodes from Glimmer AST nodes
  function addHandlebarPrefix(node) {
    if (!node || typeof node !== "object") {
      return node;
    }

    // Create a new node with prefixed type
    const newNode = { ...node };
    if (newNode.type) {
      newNode.type = `Handlebar_${newNode.type}`;
    }

    // Recursively process child nodes - all children of unsupported constructs
    // are also from Handlebars.js parser and need prefixing
    for (const key in newNode) {
      if (key === "loc" || key === "parent") {
        continue;
      }

      const value = newNode[key];
      if (Array.isArray(value)) {
        newNode[key] = value.map((child) => addHandlebarPrefix(child));
      } else if (value && typeof value === "object") {
        newNode[key] = addHandlebarPrefix(value);
      }
    }

    return newNode;
  }

  // Restore original handlebars nodes that were replaced with placeholders
  function restorePlaceholders(node) {
    if (!node || typeof node !== "object") {
      return node;
    }

    // Handle text nodes - check if they contain placeholders to restore
    if (node.type === "TextNode" && node.chars) {
      // Check if this text node is exactly a placeholder
      if (placeholderMap.has(node.chars)) {
        // Replace the entire text node with the original handlebars node with prefix
        const originalNode = placeholderMap.get(node.chars);
        return addHandlebarPrefix(originalNode);
      }

      // Handle mixed content with placeholders
      let currentText = node.chars;
      const restoredNodes = [];
      let hasPlaceholders = false;

      // Process text by finding and replacing placeholders one by one
      while (currentText) {
        let foundPlaceholder = false;
        let earliestPos = currentText.length;
        let earliestPlaceholder = null;

        // Find the earliest placeholder in the remaining text
        for (const placeholder of placeholderMap.keys()) {
          const pos = currentText.indexOf(placeholder);
          if (pos !== -1 && pos < earliestPos) {
            earliestPos = pos;
            earliestPlaceholder = placeholder;
          }
        }

        if (earliestPlaceholder) {
          foundPlaceholder = true;
          hasPlaceholders = true;

          // Add text before placeholder if any
          if (earliestPos > 0) {
            const beforeText = currentText.slice(0, earliestPos);
            restoredNodes.push({
              type: "TextNode",
              chars: beforeText,
              loc: node.loc,
            });
          }

          // Add the restored original node with Handlebar prefix
          const originalNode = placeholderMap.get(earliestPlaceholder);
          restoredNodes.push(addHandlebarPrefix(originalNode));

          // Continue with text after the placeholder
          currentText = currentText.slice(
            earliestPos + earliestPlaceholder.length,
          );
        }

        if (!foundPlaceholder) {
          // No more placeholders, add remaining text if any
          if (currentText) {
            restoredNodes.push({
              type: "TextNode",
              chars: currentText,
              loc: node.loc,
            });
          }
          break;
        }
      }

      // If we had placeholders, return the array of restored nodes
      // Otherwise return the original node
      return hasPlaceholders ? restoredNodes : node;
    }

    // Recursively process child nodes
    const newNode = { ...node };

    if (Array.isArray(node.children)) {
      newNode.children = processChildArray(node.children);
    }

    if (Array.isArray(node.body)) {
      newNode.body = processChildArray(node.body);
    }

    // Handle BlockStatement program blocks
    if (node.program && node.program.body && Array.isArray(node.program.body)) {
      newNode.program = {
        ...node.program,
        body: processChildArray(node.program.body),
      };
    }

    // Handle inverse blocks
    if (node.inverse && node.inverse.body && Array.isArray(node.inverse.body)) {
      newNode.inverse = {
        ...node.inverse,
        body: processChildArray(node.inverse.body),
      };
    }

    return newNode;
  }

  // Helper function to process arrays of child nodes
  function processChildArray(children) {
    const result = [];

    for (const child of children) {
      const restored = restorePlaceholders(child);

      // If restoration returned an array (from mixed content), spread it
      if (Array.isArray(restored)) {
        result.push(...restored);
      } else if (restored !== null && restored !== undefined) {
        result.push(restored);
      }
    }

    return result;
  }

  const result = restorePlaceholders(glimmerAst);
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
  astFormat: "hbs", // Use hbs format for separate HBS functionality
  locStart,
  locEnd,
};
