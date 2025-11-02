import {
  FORMAT_PRAGMA_TO_INSERT,
  HTML_HAS_IGNORE_PRAGMA_REGEXP,
  HTML_HAS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

const hasPragma = (text) => HTML_HAS_PRAGMA_REGEXP.test(text);
const hasIgnorePragma = (text) => HTML_HAS_IGNORE_PRAGMA_REGEXP.test(text);
const insertPragma = (text) =>
  `<!-- @${FORMAT_PRAGMA_TO_INSERT} -->\n\n${text}`;

export { hasIgnorePragma, hasPragma, insertPragma };
