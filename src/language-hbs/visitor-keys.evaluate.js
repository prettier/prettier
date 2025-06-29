import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const additionalHandlebarsKeys = {
  PartialStatement: ["name", "params", "hash"],
  PartialBlockStatement: ["name", "params", "hash", "program", "inverse"],
  DecoratorBlock: ["path", "params", "hash", "program"],
  Decorator: ["path", "params", "hash"], // Standalone decorators
  Program: ["body"], // Handlebars Program node uses only "body"
  ContentStatement: [], // Handlebars text content node
};

const visitorKeys = {
  ...glimmerVisitorKeys,
  ...additionalHandlebarsKeys,
};

export default visitorKeys;
