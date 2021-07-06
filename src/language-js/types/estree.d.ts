import * as ESTree from "estree";
import * as Babel from "@babel/types";
import { TSESTree } from "@typescript-eslint/typescript-estree";
import { ESTree as Meriyah } from "meriyah";
import * as NGTree from "angular-estree-parser/lib/types";

type AdditionalFields = {
  extra?: {
    parenthesized?: boolean;
    raw?: string;
  };
  comments?: Comment[];
  trailingComments?: ReadonlyArray<Comment> | Comment[];
  leadingComments?: ReadonlyArray<Comment> | Comment[];
};

export type Comment = (
  | ESTree.Comment
  | Babel.Comment
  | TSESTree.Comment
  | Meriyah.Comment
) & {
  printed?: boolean;
  trailing?: boolean;
  leading?: boolean;
};

export type Node = (ESTree.Node | Babel.Node | TSESTree.Node | NGTree.NGNode) &
  AdditionalFields;

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

export type OptionalCallExpression = Babel.OptionalCallExpression &
  AdditionalFields;

export type MemberExpression = (
  | ESTree.MemberExpression
  | Babel.MemberExpression
  | TSESTree.MemberExpression
) &
  AdditionalFields;

export type OptionalMemberExpression = Babel.OptionalMemberExpression &
  AdditionalFields;

export type Expression = (
  | ESTree.Expression
  | Babel.Expression
  | TSESTree.Expression
) &
  AdditionalFields;

export type BindExpression = Babel.BindExpression & AdditionalFields;

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
