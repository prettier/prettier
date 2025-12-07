import type * as Babel from "@babel/types";
import type { ESTree as MeriyahESTree } from "meriyah";
import type { NGTree } from "angular-estree-parser";
import type * as TSESTree from "./typescript-estree.ts";
import type * as FlowESTree from "./flow-estree.js";

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

export type Node = (
  | PrettierNode
  | Babel.Node
  | TSESTree.Node
  | NGTree.NGNode
  | FlowESTree.ESNode
  | FlowAdditionalNode
) & {
  extra?: {
    parenthesized?: boolean;
    raw?: string;
  };
  comments?: Comment[];
};

export type Comment = (
  | Babel.Comment
  | TSESTree.Comment
  | MeriyahESTree.Comment
  | { type: "Hashbang"; value: string }
  | Babel.InterpreterDirective
) & {
  printed?: boolean;
  trailing?: boolean;
  leading?: boolean;
};

export type NodeMap = CreateNodeMap<Node>;
export type CommentMap = CreateNodeMap<Comment>;

type CreateNodeMap<InputNode extends Node | Comment> = {
  [NodeType in InputNode["type"]]: Extract<InputNode, { type: NodeType }>;
};
