import type * as Babel from "@babel/types";
import type { ESTree as MeriyahESTree } from "meriyah";
import type { NGTree } from "angular-estree-parser";
import type * as TSESTree from "./typescript-estree.ts";
import type * as FlowESTree from "./flow-estree.js";

type PrettierNodeAdditionalProperties = {
  extra?: {
    parenthesized?: boolean;
    raw?: string;
  };
  comments?: Comment[];
  prettierIgnore?: boolean;
};

type PrettierCommentAdditionalProperties = {
  printed?: boolean;
  trailing?: boolean;
  leading?: boolean;
};

type FlowAdditionalNode =
  | {
      type: "SatisfiesExpression";
      expression: FlowESTree.Expression;
      typeAnnotation: FlowESTree.TypeAnnotationType;
    }
  | { type: "NeverTypeAnnotation" }
  | { type: "UndefinedTypeAnnotation" }
  | { type: "UnknownTypeAnnotation" };

type PrettierNode = { type: "JsExpressionRoot"; node: Babel.Expression };

export type Comment = (
  | Babel.Comment
  | TSESTree.Comment
  | MeriyahESTree.Comment
  | { type: "Hashbang"; value: string }
  | Babel.InterpreterDirective
) &
  PrettierCommentAdditionalProperties;

type _Node =
  | PrettierNode
  | Babel.Node
  | TSESTree.Node
  | NGTree.NGNode
  | FlowESTree.ESNode
  | FlowAdditionalNode;

export type Node = ExtendNode<_Node>;

export type NodeMap = CreateNodeMap<Node>;
export type CommentMap = CreateNodeMap<Comment>;

type CreateNodeMap<Input extends Node | Comment> = {
  [NodeType in Input["type"]]: Extract<Input, { type: NodeType }>;
};

type ExtendNode<Input> = Input extends _Node
  ? {
      [Key in keyof Input]: ExtendNode<Input[Key]>;
    } & PrettierNodeAdditionalProperties
  : Input extends readonly any[]
    ? ExtendNode<Input[number]>[]
    : Input;
