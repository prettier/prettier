import {
  FORMAT_PRAGMA_TO_INSERT,
  GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP,
  GRAPHQL_HAS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

const hasPragma = (text) => GRAPHQL_HAS_PRAGMA_REGEXP.test(text);
const hasIgnorePragma = (text) => GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP.test(text);
const insertPragma = (text) => `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;

export { hasIgnorePragma, hasPragma, insertPragma };
