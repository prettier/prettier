import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { visitorKeys as angularVisitorKeys } from "angular-estree-parser";
import flowVisitorKeys from "hermes-parser/dist/generated/ESTreeVisitorKeys.js";
import unionVisitorKeys from "./union-visitor-keys.js";

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

  // `@typescript-eslint/typescript-estree` v6 renamed `typeParameters` to `typeArguments`
  // Remove those when babel update AST
  JSXOpeningElement: ["typeParameters"],
  TSClassImplements: ["typeParameters"],
  TSInterfaceHeritage: ["typeParameters"],

  // Flow, missed in `flowVisitorKeys`
  NeverTypeAnnotation: [],
  SatisfiesExpression: ["expression", "typeAnnotation"],
  TupleTypeAnnotation: ["elementTypes"],
  TypePredicate: ["asserts"],
  UndefinedTypeAnnotation: [],
  UnknownTypeAnnotation: [],
};

const excludeKeys = {
  // From `tsVisitorKeys`
  MethodDefinition: ["typeParameters"],

  // From `flowVisitorKeys`
  ArrowFunctionExpression: ["id"],
  FunctionExpression: ["predicate"],
  // Flow don't use it, but `typescript-eslint` v6 switched to `typeArguments`
  // JSXOpeningElement: ["typeArguments"],
  // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
  // Flow parser changed `.types` to `.elementTypes` https://github.com/facebook/flow/commit/5b60e6a81dc277dfab2e88fa3737a4dc9aafdcab
  // TupleTypeAnnotation: ["types"],
  PropertyDefinition: ["tsModifiers"],
  // Not supported yet.
  // https://github.com/facebook/hermes/commit/55a5f881361ef15fd4f7b558166d80e7b9086550
  DeclareOpaqueType: ["impltype", "lowerBound", "upperBound"],
  OpaqueType: ["lowerBound", "upperBound"],

  // Legacy property
  ExportAllDeclaration: ["assertions"],
  ExportNamedDeclaration: ["assertions"],
  ImportDeclaration: ["assertions"],
  ImportExpression: ["attributes"],
  TSMappedType: ["typeParameter"],
  TSEnumDeclaration: ["members"],
};

const excludeNodeTypes = new Set([
  // Babel will remove in v8
  // https://github.com/babel/babel/pull/17242
  "TupleExpression",
  "RecordExpression",
  "DecimalLiteral",
  // Babel, Won't exist since we use `createImportExpressions` when parsing with babel
  "Import",
]);

const visitorKeys = Object.fromEntries(
  Object.entries(
    unionVisitorKeys([
      babelVisitorKeys,
      tsVisitorKeys,
      flowVisitorKeys,
      angularVisitorKeys,
      additionalVisitorKeys,
    ]),
  )
    .filter(([type]) => !excludeNodeTypes.has(type))
    .map(([type, keys]) => [
      type,
      excludeKeys[type]
        ? keys.filter((key) => !excludeKeys[type].includes(key))
        : keys,
    ]),
);

export default visitorKeys;
