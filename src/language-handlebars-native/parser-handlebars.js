import Handlebars from "handlebars";
import { html as htmlParser } from "../language-html/parser-html.js";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";

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
    // Use hybrid parsing approach
    ast = parseWithHybridApproach(text);
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

function parseWithHybridApproach(text) {
  // Step 1: Parse with handlebars to get expressions
  const handlebarsAst = Handlebars.parse(text);
  addLocations(handlebarsAst, text);

  // Step 2: Check if this template has expressions between attributes
  // If so, fall back to handlebars-only parsing to preserve structure
  if (hasExpressionsBetweenAttributes(text, handlebarsAst)) {
    return handlebarsAst;
  }

  // Step 3: Create safe placeholder system
  const placeholderSystem = new SafePlaceholderSystem(text);

  // Step 4: Replace handlebars expressions with placeholders and capture original case
  const { htmlText, placeholderMap, attributePositions } =
    replaceMustachesWithPlaceholders(text, handlebarsAst, placeholderSystem);

  // Step 5: Try to parse as HTML if it looks like HTML
  if (looksLikeHtml(htmlText)) {
    try {
      const htmlAst = parseHtml(htmlText);
      // Step 6: Merge the ASTs with case preservation
      return mergeAsts(htmlAst, handlebarsAst, placeholderMap, attributePositions);
    } catch {
      // Fallback to handlebars-only if HTML parsing fails
      return handlebarsAst;
    }
  }

  // If it doesn't look like HTML, just return handlebars AST
  return handlebarsAst;
}

function hasExpressionsBetweenAttributes(text, handlebarsAst) {
  // Extract all expressions from the handlebars AST
  const expressions = [];

  function collectExpressions(node) {
    if (!node || typeof node !== "object") return;

    if (
      node.type === "MustacheStatement" ||
      node.type === "BlockStatement" ||
      node.type === "PartialStatement" ||
      node.type === "CommentStatement"
    ) {
      if (
        node.loc &&
        node.loc.start.offset !== undefined &&
        node.loc.end.offset !== undefined
      ) {
        expressions.push({
          start: node.loc.start.offset,
          end: node.loc.end.offset,
          type: node.type,
        });
      }
    }

    // Recursively collect from children
    for (const key in node) {
      if (key === "loc" || key === "parent") {
        continue;
      }

      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          collectExpressions(child);
        }
      } else if (value && typeof value === "object") {
        collectExpressions(value);
      }
    }
  }

  collectExpressions(handlebarsAst);

  // Check if any expressions appear to be between attributes
  for (const expr of expressions) {
    const beforeExpr = text.slice(Math.max(0, expr.start - 100), expr.start);
    const afterExpr = text.slice(
      expr.end,
      Math.min(text.length, expr.end + 100),
    );

    // Pattern: Look for expressions that have attributes before and after them
    // within the same element (basic heuristic)
    const hasAttrBefore =
      /[@\w-]+\s*=\s*["'][^"']*["']\s*$/u.test(beforeExpr) ||
      /\s+[\w-]+\s*$/u.test(beforeExpr);
    const hasAttrAfter = /^\s*[@\w-]+\s*=/u.test(afterExpr);

    // Also check for self-closing tag pattern
    const isInSelfClosingTag = /^\s*[.\w\s="'-]*\/>\s*$/u.test(afterExpr);

    if (
      (hasAttrBefore && hasAttrAfter) ||
      (hasAttrBefore && isInSelfClosingTag)
    ) {
      return true;
    }
  }

  return false;
}

function replaceMustachesWithPlaceholders(
  text,
  handlebarsAst,
  placeholderSystem,
) {
  let htmlText = text;
  const placeholderMap = new Map();

  // Capture original attribute names with their positions for case preservation  
  const attributePositions = [];
  let attributeCounter = 0;

  // Extract ALL attribute names with positions before any processing
  const attrNameRegex = /\s+([\w-]+)\s*=/giu;
  let match;
  while ((match = attrNameRegex.exec(text)) !== null) {
    attributePositions.push({
      name: match[1],
      position: match.index + match[0].indexOf(match[1]),
      order: attributeCounter++
    });
  }

  // Extract all expressions from the handlebars AST in reverse order
  // (reverse order to avoid offset issues when replacing)
  const expressions = [];

  function collectExpressions(node) {
    if (!node || typeof node !== "object") return;

    if (
      node.type === "MustacheStatement" ||
      node.type === "BlockStatement" ||
      node.type === "PartialStatement" ||
      node.type === "CommentStatement"
    ) {
      if (
        node.loc &&
        node.loc.start.offset !== undefined &&
        node.loc.end.offset !== undefined
      ) {
        expressions.push({
          node,
          start: node.loc.start.offset,
          end: node.loc.end.offset,
        });
      }
    }

    // Recursively collect from children
    for (const key in node) {
      if (key === "loc" || key === "parent") {
        continue;
      }

      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          collectExpressions(child);
        }
      } else if (value && typeof value === "object") {
        collectExpressions(value);
      }
    }
  }

  collectExpressions(handlebarsAst);

  // Sort by start position (reverse order for replacement)
  expressions.sort((a, b) => b.start - a.start);

  // Replace each expression with a placeholder
  for (const expr of expressions) {
    const placeholder = placeholderSystem.createPlaceholder(expr.node);
    placeholderMap.set(placeholder, expr.node);

    htmlText =
      htmlText.slice(0, expr.start) + placeholder + htmlText.slice(expr.end);
  }

  return { htmlText, placeholderMap, attributePositions };
}

function looksLikeHtml(text) {
  // Remove placeholders to avoid false positives - updated for lowercase
  const textWithoutPlaceholders = text.replaceAll(/__[a-z_]+\d+__/gu, "");

  // Basic HTML detection heuristics
  const htmlPatterns = [
    /<[a-z][^>]*>/iu, // Opening tag
    /<\/[a-z][^>]*>/iu, // Closing tag
    /<!DOCTYPE/iu, // Doctype
    /<!--/u, // HTML comment
  ];

  // Check if any HTML pattern matches
  return htmlPatterns.some((pattern) => pattern.test(textWithoutPlaceholders));
}

function parseHtml(htmlText) {
  // Use Prettier's existing HTML parser with case preservation
  try {
    const htmlAst = htmlParser.parse(htmlText, {
      // Try to preserve case - though HTML parser may still normalize
    });
    return htmlAst;
  } catch (error) {
    // Re-throw with more context
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`HTML parsing failed: ${message}`);
  }
}

function mergeAsts(
  htmlAst,
  handlebarsAst,
  placeholderMap,
  attributePositions = [],
) {
  let attributeOrderCounter = 0; // Track which attribute we're processing
  
  // Walk through the HTML AST and replace placeholders with handlebars expressions
  function replacePlaceholders(node) {
    if (!node || typeof node !== "object") return node;

    // Handle text nodes
    if (node.type === "text" && node.value) {
      // Check if this text node contains a placeholder
      for (const [placeholder, hbsNode] of placeholderMap.entries()) {
        if (node.value === placeholder) {
          // Replace the entire text node with the handlebars expression
          return hbsNode;
        } else if (node.value.includes(placeholder)) {
          // Split the text and create a ConcatStatement
          const parts = [];
          let remainingText = node.value;

          // Find all placeholders in this text
          const placeholdersInText = Array.from(placeholderMap.keys())
            .filter((p) => remainingText.includes(p))
            .sort(
              (a, b) => remainingText.indexOf(a) - remainingText.indexOf(b),
            );

          for (const ph of placeholdersInText) {
            const index = remainingText.indexOf(ph);
            if (index > 0) {
              // Add text before placeholder
              parts.push({
                type: "text",
                value: remainingText.slice(0, index),
              });
            }

            // Add the handlebars expression
            parts.push(placeholderMap.get(ph));

            // Update remaining text
            remainingText = remainingText.slice(index + ph.length);
          }

          if (remainingText) {
            parts.push({
              type: "text",
              value: remainingText,
            });
          }

          return {
            type: "ConcatStatement",
            parts,
          };
        }
      }
    }

    // Handle element nodes - check for placeholder attributes
    if (node.type === "element" && node.attrs) {
      const newAttrs = [];
      const standaloneExpressions = [];

      for (const attr of node.attrs) {
        // Check if attribute name is a placeholder
        if (placeholderMap.has(attr.name)) {
          // This is a handlebars expression that was misinterpreted as an attribute
          standaloneExpressions.push(placeholderMap.get(attr.name));
        } else {
          // Regular attribute - process value if it exists and restore original case
          const newAttr = { ...attr };

          // Restore original case using order-based matching
          // Match attributes by processing order
          const attributeAtOrder = attributePositions.find(pos => pos.order === attributeOrderCounter);
          if (attributeAtOrder && attributeAtOrder.name.toLowerCase() === attr.name.toLowerCase()) {
            if (attributeAtOrder.name !== attr.name) {
              newAttr.name = attributeAtOrder.name;
              // console.log(`DEBUG: Case restored from "${attr.name}" to "${attributeAtOrder.name}" (order ${attributeOrderCounter})`);
            }
          }
          attributeOrderCounter++;

          if (attr.value !== null) {
            // Create a text node for the attribute value and process it
            const valueNode = { type: "text", value: attr.value };
            const processedValue = replacePlaceholders(valueNode);

            if (processedValue.type === "text") {
              newAttr.value = processedValue.value;
            } else {
              // Attribute value contains handlebars expressions
              newAttr.value = processedValue;
            }
          }
          newAttrs.push(newAttr);
        }
      }

      const newNode = {
        ...node,
        attrs: newAttrs,
      };

      // If we found standalone expressions, add them as children
      if (standaloneExpressions.length > 0) {
        const newChildren = [
          ...standaloneExpressions,
          ...(node.children || []).map(replacePlaceholders).filter(Boolean),
        ];
        newNode.children = newChildren;
      } else if (node.children) {
        newNode.children = node.children
          .map(replacePlaceholders)
          .filter(Boolean);
      }

      return newNode;
    }

    // Recursively process child nodes
    const newNode = { ...node };

    if (Array.isArray(node.children)) {
      newNode.children = node.children.map(replacePlaceholders).filter(Boolean);
    }

    if (Array.isArray(node.body)) {
      newNode.body = node.body.map(replacePlaceholders).filter(Boolean);
    }

    return newNode;
  }

  return replacePlaceholders(htmlAst);
}

function getErrorMessage(error) {
  const { message } = error;

  // Extract meaningful error message from handlebars
  if (message.includes("Parse error on line")) {
    return message.split("\n")[0];
  }

  return message;
}

function getErrorLocation(error, text) {
  const { message } = error;

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

export const handlebars = {
  parse,
  astFormat: "handlebars",
  locStart,
  locEnd,
};
