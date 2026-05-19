import { QueryDocumentKeys as graphqlVisitorKeys } from "graphql/language/ast.mjs";

const visitorKeys = { ...graphqlVisitorKeys };

// Unable to produce https://github.com/prettier/prettier/issues/18212#issuecomment-3506234429
for (const kind of [
  "ArgumentCoordinate",
  "DirectiveArgumentCoordinate",
  "DirectiveCoordinate",
  "MemberCoordinate",
  "TypeCoordinate",
]) {
  delete visitorKeys[kind];
}

export default visitorKeys;
