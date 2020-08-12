import * as ESTree from "estree";
import * as Babel from "@babel/types";
import { TSESTree } from "@typescript-eslint/types";
import * as NGTree from "angular-estree-parser/lib/types";

// WORKAROUND HACK for typescript-eslint issue:
// https://github.com/typescript-eslint/typescript-eslint/issues/2388
// MUST REMOVE to avoid errors with TypeScript 4.0.0:
import * as ts from "typescript";
declare module "typescript" {
  type NamedTupleMember = Node;
}

type AnyNode = ESTree.Node | Babel.Node | TSESTree.Node | NGTree.NGNode;

type AnyTemplateLiteral =
  | ESTree.TemplateLiteral
  | Babel.TemplateLiteral
  | TSESTree.TemplateLiteral;

type AnyComment = ESTree.Comment | Babel.Comment | TSESTree.Comment;

export type CallExpression =
  | ESTree.CallExpression
  | Babel.CallExpression
  | TSESTree.CallExpression;
export type OptionalCallExpression =
  | Babel.OptionalCallExpression
  | TSESTree.OptionalCallExpression;
export type MemberExpression =
  | ESTree.MemberExpression
  | Babel.MemberExpression
  | TSESTree.MemberExpression;
export type OptionalMemberExpression =
  | Babel.OptionalMemberExpression
  | TSESTree.OptionalMemberExpression;
export type Expression =
  | ESTree.Expression
  | Babel.Expression
  | TSESTree.Expression;
export type BindExpression = Babel.BindExpression;
export type Property = ESTree.Property | Babel.Property | TSESTree.Property;
export type ClassPrivateProperty = Babel.ClassPrivateProperty;
export type ObjectTypeProperty = Babel.ObjectTypeProperty;
export type JSXElement = Babel.JSXElement | TSESTree.JSXElement;
export type TaggedTemplateExpression =
  | ESTree.TaggedTemplateExpression
  | Babel.TaggedTemplateExpression
  | TSESTree.TaggedTemplateExpression;
export type Literal = ESTree.Literal | Babel.Literal | TSESTree.Literal;

export type Comment = AnyComment & {
  printed?: boolean;
  trailing?: boolean;
  leading?: boolean;
};

export type TemplateLiteral = AnyTemplateLiteral & {
  extra?: any;
  comments?: Comment[];
  trailingComments?: ReadonlyArray<Comment>;
  leadingComments?: ReadonlyArray<Comment>;
};

export type Node = AnyNode & {
  extra?: any;
  comments?: Comment[];
  trailingComments?: ReadonlyArray<Comment>;
};

export { ESTree, Babel, TSESTree, NGTree };
