import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";

const visitorKeys = {
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
};

export default createGetVisitorKeys(visitorKeys);
