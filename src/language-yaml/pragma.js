import {
  FORMAT_PRAGMA_TO_INSERT,
  YAML_HAS_PRAGMA_REGEXP,
  YAML_IS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

function isPragma(text) {
  // FIXME
  return YAML_IS_PRAGMA_REGEXP.test(text);
}

function hasPragma(text) {
  // FIXME
  return YAML_HAS_PRAGMA_REGEXP.test(text);
}

function insertPragma(text) {
  return `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;
}

export { hasPragma, insertPragma, isPragma };
