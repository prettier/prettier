import {
  FORMAT_PRAGMA_TO_INSERT,
  YAML_HAS_IGNORE_PRAGMA_REGEXP,
  YAML_HAS_PRAGMA_REGEXP,
  YAML_IS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

const isPragma = (text) => YAML_IS_PRAGMA_REGEXP.test(text);
const hasPragma = (text) => YAML_HAS_PRAGMA_REGEXP.test(text);
const hasIgnorePragma = (text) => YAML_HAS_IGNORE_PRAGMA_REGEXP.test(text);
const insertPragma = (text) => `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;

export { hasIgnorePragma, hasPragma, insertPragma, isPragma };
