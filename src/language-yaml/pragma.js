import {
  FORMAT_PRAGMA_TO_INSERT,
  YAML_HAS_IGNORE_PRAGMA_REGEXP,
  YAML_HAS_PRAGMA_REGEXP,
  YAML_IS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

function isPragma(text) {
  return YAML_IS_PRAGMA_REGEXP.test(text);
}

function hasPragma(text) {
  return YAML_HAS_PRAGMA_REGEXP.test(text);
}

function hasIgnorePragma(text) {
  return YAML_HAS_IGNORE_PRAGMA_REGEXP.test(text);
}

function insertPragma(text) {
  return `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;
}

export { hasIgnorePragma, hasPragma, insertPragma, isPragma };
