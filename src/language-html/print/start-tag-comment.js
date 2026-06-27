import { replaceEndOfLine } from "../../document/index.js";

// Based on JS comment print src/language-js/print/comment.js

function printStartTagComment(path) {
  const {
    node: { value, type },
  } = path;

  if (type === "single") {
    return `//${value.trimEnd()}`;
  }

  // TODO: support indentable block comment

  return ["/*", replaceEndOfLine(value), "*/"];
}

export { printStartTagComment };
