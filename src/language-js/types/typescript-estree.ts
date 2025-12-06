import type { TSESTree } from "@typescript-eslint/typescript-estree";

type NodeOrComment = TSESTree.Node | TSESTree.Comment;

type ConvertTypeToString<Node extends NodeOrComment> = {
  [Key in keyof Node]: Key extends "type" ? `${Node[Key]}` : Node[Key];
};

export type Node = ConvertTypeToString<TSESTree.Node>;
export type Comment = ConvertTypeToString<TSESTree.Comment>;
