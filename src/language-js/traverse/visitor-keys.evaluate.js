import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { VISITOR_KEYS as babelVisitorKeys } from "babel-types";

function unionVisitorKeys(...visitorKeys) {
  const result = {};

  for (const keys of visitorKeys) {
    for (const [key, value] of Object.entries(keys)) {
      if (!result[key]) {
        result[key] = value;
      } else {
        result[key] = [...new Set([...result[key], ...value])];
      }
    }
  }

  return result;
}

export default unionVisitorKeys(tsVisitorKeys, babelVisitorKeys);
