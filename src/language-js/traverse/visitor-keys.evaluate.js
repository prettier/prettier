import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { visitorKeys as angularVisitorKeys } from "angular-estree-parser";
import flowVisitorKeys from "hermes-parser/dist/generated/ESTreeVisitorKeys.js";
import {
  removeNodeTypes,
  removeVisitorKeys,
  unionVisitorKeys,
} from "./utilities.js";

const additionalVisitorKeys = {
  // Prettier
  NGRoot: ["node"],
  JsExpressionRoot: ["node"],
  JsonRoot: ["node"],

  // TypeScript
  TSJSDocAllType: [],
  TSJSDocUnknownType: [],
  TSJSDocNullableType: ["typeAnnotation"],
  TSJSDocNonNullableType: ["typeAnnotation"],

  // Flow, missed in `flowVisitorKeys`
  NeverTypeAnnotation: [],
  SatisfiesExpression: ["expression", "typeAnnotation"],
  TupleTypeAnnotation: ["elementTypes"],
  TypePredicate: ["asserts"],
  UndefinedTypeAnnotation: [],
  UnknownTypeAnnotation: [],
};

const excludeVisitorKeys = {
  // From `flowVisitorKeys`
  ArrowFunctionExpression: ["id"],
  FunctionExpression: ["predicate"],

  // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
  // Flow parser changed `.types` to `.elementTypes` https://github.com/facebook/flow/commit/5b60e6a81dc277dfab2e88fa3737a4dc9aafdcab
  // TupleTypeAnnotation: ["types"],

  // Not supported yet.
  // https://github.com/facebook/hermes/commit/55a5f881361ef15fd4f7b558166d80e7b9086550
  DeclareOpaqueType: ["impltype"],

  // Legacy properties
  ExportAllDeclaration: ["assertions"],
  ImportDeclaration: ["assertions"],
};

// https://github.com/babel/babel/issues/17524
const excludeNodeTypes = [
  // Babel will remove in v8
  // https://github.com/babel/babel/pull/17242
  "TupleExpression",
  "RecordExpression",
  // Babel, Won't exist since we use `createImportExpressions` when parsing with babel
  "Import",
];

let visitorKeys = unionVisitorKeys(
  babelVisitorKeys,
  tsVisitorKeys,
  flowVisitorKeys,
  angularVisitorKeys,
  additionalVisitorKeys,
);

visitorKeys = removeNodeTypes(visitorKeys, excludeNodeTypes);
visitorKeys = removeVisitorKeys(visitorKeys, excludeVisitorKeys);

export default visitorKeys;
