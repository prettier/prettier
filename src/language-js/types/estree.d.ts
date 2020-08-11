import * as ESTree from "estree";
import * as Babel from "@babel/types";
import * as TSESTree from "@typescript-eslint/types/dist/ts-estree";
import * as NGTree from "angular-estree-parser/lib/types";

export type Node = ESTree.Node | Babel.Node | TSESTree.Node | NGTree.NGNode;
export type TemplateLiteral =
  | ESTree.TemplateLiteral
  | Babel.TemplateLiteral
  | TSESTree.TemplateLiteral;
export type Comment = ESTree.Comment | Babel.Comment | TSESTree.Comment;
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

type PrettierEsComment = Comment & {
  printed: boolean;
  trailing: boolean;
  leading: boolean;
};
export interface PrettierEsNode {
  extra: any;
  raw: string;
  comments: PrettierEsComment[];
  trailingComments: PrettierEsComment[];
  leadingComments: PrettierEsComment[];
}

export { ESTree, Babel, TSESTree, NGTree };
