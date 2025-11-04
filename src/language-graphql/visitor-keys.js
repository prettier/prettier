import { QueryDocumentKeys as graphqlVisitorKeys } from "graphql/language/ast.mjs";
import { removeNodeTypes } from "../language-js/traverse/utilities.js";

// Unsupported features
// https://github.com/prettier/prettier/issues/18212
let visitorKeys = graphqlVisitorKeys;
visitorKeys = removeNodeTypes(visitorKeys, [
  "ArgumentCoordinate",
  "DirectiveArgumentCoordinate",
  "DirectiveCoordinate",
  "MemberCoordinate",
  "TypeCoordinate",
]);

export default visitorKeys;
