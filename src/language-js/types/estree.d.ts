import * as ESTree from "estree";
import * as Babel from "@babel/types";
import { TSESTree } from "@typescript-eslint/types";
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
export type MemberExpression =
  | ESTree.MemberExpression
  | Babel.MemberExpression
  | TSESTree.MemberExpression;
export type OptionalMemberExpression =
  | Babel.OptionalMemberExpression
  | TSESTree.OptionalMemberExpression;
export type BindExpression = Babel.BindExpression;
export type Property = ESTree.Property | Babel.Property | TSESTree.Property;
export type ClassPrivateProperty = Babel.ClassPrivateProperty;
