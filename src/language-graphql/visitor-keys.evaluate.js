import { QueryDocumentKeys as graphqlVisitorKeys } from "graphql/language/ast.mjs";
import {
  generateReferenceSharedVisitorKeys,
  removeNodeTypes,
} from "../utilities/visitor-keys.js";

let visitorKeys = { ...graphqlVisitorKeys };

// Unable to produce https://github.com/prettier/prettier/issues/18212#issuecomment-3506234429
visitorKeys = removeNodeTypes(visitorKeys, [
  "ArgumentCoordinate",
  "DirectiveArgumentCoordinate",
  "DirectiveCoordinate",
  "MemberCoordinate",
  "TypeCoordinate",
]);

visitorKeys = generateReferenceSharedVisitorKeys(visitorKeys);

export default visitorKeys;
