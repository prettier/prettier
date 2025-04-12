import {
  FORMAT_PRAGMA_TO_INSERT,
  HTML_HAS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

function hasPragma(text) {
  // FIXME
  return HTML_HAS_PRAGMA_REGEXP.test(text);
}

function insertPragma(text) {
  return `<!-- @${FORMAT_PRAGMA_TO_INSERT} -->\n\n${text}`;
}

export { hasPragma, insertPragma };
