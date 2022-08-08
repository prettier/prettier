import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import unionVisitorKeys from "./union-visitor-keys.js"

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

const additionalVisitorKeys = {
  SpreadProperty: ["argument"],
  QualifiedTypeofIdentifier: ["id", "qualification"],
  JsExpressionRoot: ["node"],
  JsonRoot: ["node"],
  TSJSDocAllType: [],
  TSJSDocUnknownType: [],
  "TSJSDocNullableType": ["typeAnnotation"],
  "TSJSDocNonNullableType": ["typeAnnotation"],
  BigIntLiteralTypeAnnotation: [],
  "BigIntTypeAnnotation": []
}

export default unionVisitorKeys([
  babelVisitorKeys,
  tsVisitorKeys,
  angularVisitorKeys,
  additionalVisitorKeys,
]);
