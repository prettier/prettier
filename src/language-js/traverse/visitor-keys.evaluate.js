import { VISITOR_KEYS as babelVisitorKeys } from "@babel/types";
import { visitorKeys as tsVisitorKeys } from "@typescript-eslint/visitor-keys";
import { visitorKeys as angularVisitorKeys } from "angular-estree-parser";
import flowVisitorKeys from "hermes-parser/dist/generated/ESTreeVisitorKeys.js";
import {
  addVisitorKeys,
  generateReferenceSharedVisitorKeys,
  removeNodeTypes,
  removeVisitorKeys,
  unionVisitorKeys,
} from "../../utilities/visitor-keys.js";

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

  // Flow
  // `SatisfiesExpression` is a private feature https://github.com/facebook/hermes/issues/1808#issuecomment-3392476828
  SatisfiesExpression: ["expression", "typeAnnotation"],
};

const excludeVisitorKeys = {
  // Not supported yet.
  // https://github.com/facebook/hermes/commit/55a5f881361ef15fd4f7b558166d80e7b9086550
  DeclareOpaqueType: ["impltype"],

  // Legacy properties
  ExportAllDeclaration: ["assertions"],
  ImportDeclaration: ["assertions"],

  // Flow node from Babel
  TupleTypeAnnotation: ["types"],

  // https://github.com/babel/babel/issues/17506
  TSImportType: ["argument"],
};

// https://github.com/babel/babel/issues/17524
const excludeNodeTypes = [
  // Babel will remove in v8
  // https://github.com/babel/babel/pull/17242
  "TupleExpression",
  // Babel, Won't exist since we use `createImportExpressions` when parsing with babel
  "Import",

  // https://github.com/typescript-eslint/typescript-eslint/blob/d2d7ace4e52bedf07482fd879d8e31a52b38fc26/packages/visitor-keys/tests/visitor-keys.test.ts#L14-L18
  "ExperimentalRestProperty",
  "ExperimentalSpreadProperty",
];

let visitorKeys = unionVisitorKeys(
  babelVisitorKeys,
  tsVisitorKeys,
  flowVisitorKeys,
  angularVisitorKeys,
);

visitorKeys = addVisitorKeys(visitorKeys, additionalVisitorKeys);
visitorKeys = removeNodeTypes(visitorKeys, excludeNodeTypes);
visitorKeys = removeVisitorKeys(visitorKeys, excludeVisitorKeys);

// This should be the last step
visitorKeys = generateReferenceSharedVisitorKeys(visitorKeys);

export default visitorKeys;
