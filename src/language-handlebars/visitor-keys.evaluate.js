import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const visitorKeys = {
  VarHead: [],
  ThisHead: [],
  AtHead: [],
  ...glimmerVisitorKeys,
  PathExpression: [...glimmerVisitorKeys.PathExpression, "head"],
};

export default visitorKeys;
