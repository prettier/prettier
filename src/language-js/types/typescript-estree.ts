import type { TSESTree } from "@typescript-eslint/typescript-estree";

// Convert enum `type` to normal `string`
type ValueOf<NodeMap> = NodeMap[keyof NodeMap];
type toStringType<Node extends TSESTree.Node | TSESTree.Comment> = ValueOf<{
  [NodeType in Node["type"] as `${NodeType}`]: Omit<
    { type: NodeType } & Node,
    "type"
  > & { type: `${NodeType}` };
}>;

export type Node = toStringType<TSESTree.Node>;
export type Comment = toStringType<TSESTree.Comment>;
