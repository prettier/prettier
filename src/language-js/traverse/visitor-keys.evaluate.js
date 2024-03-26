import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import flowVisitorKeys from "hermes-parser/dist/generated/ESTreeVisitorKeys.js";

import unionVisitorKeys from "./union-visitor-keys.js";

const angularVisitorKeys = {
  NGRoot: ["node"],
  NGPipeExpression: ["left", "right", "arguments"],
  NGChainedExpression: ["expressions"],
  NGEmptyExpression: [],
  NGMicrosyntax: ["body"],
  NGMicrosyntaxKey: [],
  NGMicrosyntaxExpression: ["expression", "alias"],
  NGMicrosyntaxKeyedExpression: ["key", "expression"],
  NGMicrosyntaxLet: ["key", "value"],
  NGMicrosyntaxAs: ["key", "alias"],
};

const additionalVisitorKeys = {
  // Prettier
  JsExpressionRoot: ["node"],
  JsonRoot: ["node"],

  // TypeScript
  TSJSDocAllType: [],
  TSJSDocUnknownType: [],
  TSJSDocNullableType: ["typeAnnotation"],
  TSJSDocNonNullableType: ["typeAnnotation"],
  // `@typescript-eslint/typescript-estree` v6 renamed `typeParameters` to `typeArguments`
  // Remove those when babel update AST
  JSXOpeningElement: ["typeParameters"],
  TSClassImplements: ["typeParameters"],
  TSInterfaceHeritage: ["typeParameters"],

  // Flow, missed in `flowVisitorKeys`
  ClassPrivateProperty: ["variance"],
  ClassProperty: ["variance"],
  NeverTypeAnnotation: [],
  TupleTypeAnnotation: ["elementTypes"],
  TypePredicate: ["asserts"],
  UndefinedTypeAnnotation: [],
  UnknownTypeAnnotation: [],
  AsExpression: ["expression", "typeAnnotation"],
  AsConstExpression: ["expression"],
  SatisfiesExpression: ["expression", "typeAnnotation"],
  TypeofTypeAnnotation: ["argument", "typeArguments"],
};

const excludeKeys = {
  // From `tsVisitorKeys`
  MethodDefinition: ["typeParameters"],

  // From `flowVisitorKeys`
  ArrowFunctionExpression: ["id"],
  DeclareOpaqueType: ["impltype"],
  FunctionExpression: ["predicate"],
  // Flow don't use it, but `typescript-eslint` v6 switched to `typeArguments`
  // JSXOpeningElement: ["typeArguments"],
  // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
  // Flow parser changed `.types` to `.elementTypes` https://github.com/facebook/flow/commit/5b60e6a81dc277dfab2e88fa3737a4dc9aafdcab
  // TupleTypeAnnotation: ["types"],
  PropertyDefinition: ["tsModifiers"],

  // Legacy property
  ExportAllDeclaration: ["assertions"],
  ExportNamedDeclaration: ["assertions"],
  ImportDeclaration: ["assertions"],
};

const visitorKeys = Object.fromEntries(
  Object.entries(
    unionVisitorKeys([
      babelVisitorKeys,
      tsVisitorKeys,
      flowVisitorKeys,
      angularVisitorKeys,
      additionalVisitorKeys,
    ]),
  ).map(([type, keys]) => [
    type,
    excludeKeys[type]
      ? keys.filter((key) => !excludeKeys[type].includes(key))
      : keys,
  ]),
);

export default visitorKeys;
