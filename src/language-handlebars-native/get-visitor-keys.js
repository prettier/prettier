import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";

const visitorKeys = {
  // Handlebars native nodes
  Program: ["body"],
  ContentStatement: [],
  MustacheStatement: ["path", "params", "hash"],
  BlockStatement: ["path", "params", "hash", "program", "inverse"],
  PartialStatement: ["name", "params", "hash"],
  SubExpression: ["path", "params", "hash"],
  PathExpression: [],
  StringLiteral: [],
  NumberLiteral: [],
  BooleanLiteral: [],
  UndefinedLiteral: [],
  NullLiteral: [],
  Hash: ["pairs"],
  HashPair: ["value"],
  CommentStatement: [],

  // Prettier HTML AST nodes (from angular-html-parser)
  root: ["children"],
  element: ["children", "attrs"],
  text: [],
  comment: [],
  attribute: ["value"],
  cdata: [],
  docType: [],

  // Hybrid nodes
  Template: ["body"],
  ConcatStatement: ["parts"],

  // Legacy support for any remaining glimmer-style nodes
  ElementNode: ["children", "attributes"],
  TextNode: [],
  AttrNode: ["value"],
};

export default createGetVisitorKeys(visitorKeys);
