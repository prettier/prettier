import { findSiblingAncestors } from "../main/range.js";

const graphqlSourceElements = new Set([
  "OperationDefinition",
  "FragmentDefinition",
  "VariableDefinition",
  "TypeExtensionDefinition",
  "ObjectTypeDefinition",
  "FieldDefinition",
  "DirectiveDefinition",
  "EnumTypeDefinition",
  "EnumValueDefinition",
  "InputValueDefinition",
  "InputObjectTypeDefinition",
  "SchemaDefinition",
  "OperationTypeDefinition",
  "InterfaceTypeDefinition",
  "UnionTypeDefinition",
  "ScalarTypeDefinition",
]);

function getRangeNodes(startNodeAndAncestors, endNodeAndAncestors, options) {
  return findSiblingAncestors(
    startNodeAndAncestors,
    endNodeAndAncestors,
    (node) => graphqlSourceElements.has(node.kind),
    options,
  );
}

export { getRangeNodes };
