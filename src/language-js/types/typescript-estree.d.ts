import type { TSESTree } from "@typescript-eslint/typescript-estree";

type NodeOrComment = TSESTree.Node | TSESTree.Comment;

type ConvertTypeToString<Input> = Input extends NodeOrComment
  ? {
      [Key in keyof Input]: Key extends "type"
        ? `${Input[Key]}`
        : ConvertTypeToString<Input[Key]>;
    }
  : Input extends readonly any[]
    ? ConvertTypeToString<Input[number]>[]
    : Input;

export type Node = ConvertTypeToString<TSESTree.Node>;
export type Comment = ConvertTypeToString<TSESTree.Comment>;
