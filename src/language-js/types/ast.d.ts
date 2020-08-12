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

type ASTComment = ESTree.Comment | Babel.Comment | TSESTree.Comment;

export type Comment = ASTComment & {
  printed?: boolean;
  trailing?: boolean;
  leading?: boolean;
};

type NodeComments = {
  comments?: Comment[];
  trailingComments?: ReadonlyArray<Comment>;
  leadingComments?: ReadonlyArray<Comment>;
};

type AdditionalFields = {
  extra?: any;
} & NodeComments;

type ASTNode = ESTree.Node | Babel.Node | TSESTree.Node | NGTree.NGNode;

export type Node = ASTNode & WithExtra & WithComments;

export type TemplateLiteral = (
  | ESTree.TemplateLiteral
  | Babel.TemplateLiteral
  | TSESTree.TemplateLiteral
) &
  AdditionalFields;

export type CallExpression = (
  | ESTree.CallExpression
  | Babel.CallExpression
  | TSESTree.CallExpression
) &
  AdditionalFields;

export type OptionalCallExpression = (
  | Babel.OptionalCallExpression
  | TSESTree.OptionalCallExpression
) &
  AdditionalFields;

export type MemberExpression = (
  | ESTree.MemberExpression
  | Babel.MemberExpression
  | TSESTree.MemberExpression
) &
  AdditionalFields;

export type OptionalMemberExpression = (
  | Babel.OptionalMemberExpression
  | TSESTree.OptionalMemberExpression
) &
  AdditionalFields;

export type Expression = (
  | ESTree.Expression
  | Babel.Expression
  | TSESTree.Expression
) &
  AdditionalFields;

export type BindExpression = Babel.BindExpression & WithExtra & WithComments;

export type Property = (ESTree.Property | Babel.Property | TSESTree.Property) &
  AdditionalFields;

export type ClassPrivateProperty = Babel.ClassPrivateProperty &
  AdditionalFields;

export type ObjectTypeProperty = Babel.ObjectTypeProperty & AdditionalFields;

export type JSXElement = (Babel.JSXElement | TSESTree.JSXElement) &
  AdditionalFields;

export type TaggedTemplateExpression = (
  | ESTree.TaggedTemplateExpression
  | Babel.TaggedTemplateExpression
  | TSESTree.TaggedTemplateExpression
) &
  AdditionalFields;

export type Literal = (ESTree.Literal | Babel.Literal | TSESTree.Literal) &
  AdditionalFields;

export { ESTree, Babel, TSESTree, NGTree };
