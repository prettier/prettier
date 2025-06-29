import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const additionalHandlebarsKeys = {
  PartialStatement: ["name", "params", "hash"],
  PartialBlockStatement: ["name", "params", "hash", "program", "inverse"],
  DecoratorBlock: ["path", "params", "hash", "program"],
  Decorator: ["path", "params", "hash"], // Standalone decorators
  Program: ["body"], // Handlebars Program node uses only "body"
  ContentStatement: [], // Handlebars text content node

  // Prefixed versions for Handlebars AST nodes
  Handlebar_PartialStatement: ["name", "params", "hash"],
  Handlebar_PartialBlockStatement: [
    "name",
    "params",
    "hash",
    "program",
    "inverse",
  ],
  Handlebar_DecoratorBlock: ["path", "params", "hash", "program"],
  Handlebar_Decorator: ["path", "params", "hash"],
  Handlebar_Program: ["body"],
  Handlebar_ContentStatement: [],
  Handlebar_PathExpression: [], // PathExpression has no child nodes to visit
  Handlebar_SubExpression: ["path", "params", "hash"],
  Handlebar_MustacheStatement: ["path", "params", "hash"],
  Handlebar_BlockStatement: ["path", "params", "hash", "program", "inverse"],
  Handlebar_Hash: ["pairs"],
  Handlebar_HashPair: ["value"],
  Handlebar_StringLiteral: [],
  Handlebar_BooleanLiteral: [],
  Handlebar_NumberLiteral: [],
  Handlebar_UndefinedLiteral: [],
  Handlebar_NullLiteral: [],
  Handlebar_CommentStatement: [],
  Handlebar_MustacheCommentStatement: [],
  Handlebar_TextNode: [],
};

const visitorKeys = {
  ...glimmerVisitorKeys,
  ...additionalHandlebarsKeys,
};

export default visitorKeys;
