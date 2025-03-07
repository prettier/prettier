import { extract, parseWithComments, print, strip } from "jest-docblock";
import { normalizeEndOfLine } from "../common/end-of-line.js";
import getShebang from "./utils/get-shebang.js";

function parseDocBlock(text) {
  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length + 1);
  }

  const docBlock = extract(text);
  const { pragmas, comments } = parseWithComments(docBlock);

  return { shebang, text, pragmas, comments };
}

function hasPragma(text) {
  const { pragmas } = parseDocBlock(text);
  return Object.hasOwn(pragmas, "prettier") || Object.hasOwn(pragmas, "format");
}

function insertPragma(originalText) {
  const { shebang, text, pragmas, comments } = parseDocBlock(originalText);
  const strippedText = strip(text);

  let docBlock = print({
    pragmas: {
      format: "",
      ...pragmas,
    },
    comments: comments.trimStart(),
  });

  // normalise newlines (mitigate use of os.EOL by jest-docblock)
  // Only needed in development version on Windows,
  // bundler will hack `jest-docblock` enforce it to use `\n` in production
  if (process.env.NODE_ENV !== "production") {
    docBlock = normalizeEndOfLine(docBlock);
  }

  return (
    (shebang ? `${shebang}\n` : "") +
    docBlock +
    (strippedText.startsWith("\n") ? "\n" : "\n\n") +
    strippedText
  );
}

export { hasPragma, insertPragma };
