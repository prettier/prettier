import Handlebars from "handlebars";
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
    ast = Handlebars.parse(text);

    // Add location information
    addLocations(ast, text);
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
