import {
  FORMAT_PRAGMA_TO_INSERT,
  GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP,
  GRAPHQL_HAS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

function hasPragma(text) {
  return GRAPHQL_HAS_PRAGMA_REGEXP.test(text);
}

function hasIgnorePragma(text) {
  return GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP.test(text);
}

function insertPragma(text) {
  return `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;
}

export { hasIgnorePragma, hasPragma, insertPragma };
