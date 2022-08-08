import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";

const angularVisitorKeys = {
  NGRoot: ["node"],
  NGPipeExpression: ["left", "right", "arguments"],
  NGChainedExpression: ["expressions"],
  NGEmptyExpression: [],
  NGQuotedExpression: [],
  NGMicrosyntax: ["body"],
  NGMicrosyntaxKey: [],
  NGMicrosyntaxExpression: ["expression", "name"],
  NGMicrosyntaxKeyedExpression: ["key", "expression"],
  NGMicrosyntaxLet: ["key", "value"],
  NGMicrosyntaxAs: ["key", "alias"],
};

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

export default unionVisitorKeys(
  tsVisitorKeys,
  babelVisitorKeys,
  angularVisitorKeys
);
