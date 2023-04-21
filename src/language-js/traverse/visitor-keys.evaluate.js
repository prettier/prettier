import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { VisitorKeys as flowVisitorKeys } from "hermes-eslint";
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

  // Flow
  ClassProperty: ["variance"],
  ClassPrivateProperty: ["variance"],
  ConditionalTypeAnnotation: [
    "checkType",
    "extendsType",
    "trueType",
    "falseType",
  ],
  DeclareEnum: flowVisitorKeys.EnumDeclaration,
  InferTypeAnnotation: ["typeParameter"],
  KeyofTypeAnnotation: ["argument"],
  ObjectTypeMappedTypeProperty: [
    "keyTparam",
    "propType",
    "sourceType",
    "variance",
  ],
  QualifiedTypeofIdentifier: ["id", "qualification"],
  TupleTypeAnnotation: ["elementTypes"],
  TupleTypeSpreadElement: ["label", "typeAnnotation"],
  TupleTypeLabeledElement: ["label", "elementType", "variance"],
  NeverTypeAnnotation: [],
  UndefinedTypeAnnotation: [],
  UnknownTypeAnnotation: [],
};

const excludeKeys = {
  // From `tsVisitorKeys`
  MethodDefinition: ["typeParameters"],
  TSPropertySignature: ["initializer"],

  // From `flowVisitorKeys`
  ArrowFunctionExpression: ["id"],
  DeclareOpaqueType: ["impltype"],
  FunctionExpression: ["predicate"],
  // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
  // Flow parser changed `.types` to `.elementTypes` https://github.com/facebook/flow/commit/5b60e6a81dc277dfab2e88fa3737a4dc9aafdcab
  // TupleTypeAnnotation: ["types"],
  PropertyDefinition: ["tsModifiers"],

  // From `babelVisitorKeys`
  DeclareInterface: ["mixins", "implements"],
  InterfaceDeclaration: ["mixins", "implements"],
};

const visitorKeys = Object.fromEntries(
  Object.entries(
    unionVisitorKeys([
      babelVisitorKeys,
      tsVisitorKeys,
      flowVisitorKeys,
      angularVisitorKeys,
      additionalVisitorKeys,
    ])
  ).map(([type, keys]) => [
    type,
    excludeKeys[type]
      ? keys.filter((key) => !excludeKeys[type].includes(key))
      : keys,
  ])
);

export default visitorKeys;
