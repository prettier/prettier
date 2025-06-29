import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const additionalHandlebarsKeys = {
  PartialStatement: ["name", "params", "hash"],
  // Add other handlebars-specific node types here if needed
};

const visitorKeys = {
  ...glimmerVisitorKeys,
  ...additionalHandlebarsKeys,
};

export default visitorKeys;
