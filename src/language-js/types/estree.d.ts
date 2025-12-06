import type * as ESTree from "estree";
import type * as Babel from "@babel/types";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { ESTree as MeriyahESTree } from "meriyah";
import type { NGTree } from "angular-estree-parser";
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

type PrettierNode = { type: "JsExpressionNode"; node: Babel.Expression };

export type Node = (
  | PrettierNode
  | ESTree.Node
  | Babel.Node
  | TSESTree.Node
  // | TSESTree.TSEmptyBodyFunctionExpression // Missed?
  | NGTree.NGNode
  | FlowESTree.ESNode
  | FlowAdditionalNode
) &
  AdditionalFields;

export type Nodes = {
  [key in Node["type"]]: { type: key } & Node;
};

export type Comment = (
  | ESTree.Comment
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

export type Comments = {
  [key in Comment["type"]]: { type: key } & Comment;
};

type AdditionalFields = {
  extra?: {
    parenthesized?: boolean;
    raw?: string;
  };
  comments?: Comment[];
};
