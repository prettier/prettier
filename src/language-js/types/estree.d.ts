import * as ESTree from "estree";
import * as Babel from "@babel/types";
import { TSESTree as TSTree } from "@typescript-eslint/types";
import * as NGTree from "angular-estree-parser/lib/types";

export type Node = ESTree.Node | Babel.Node | TSTree.Node | NGTree.NGNode;
export type TemplateLiteral =
  | ESTree.TemplateLiteral
  | Babel.TemplateLiteral
  | TSTree.TemplateLiteral;
export type Comment = ESTree.Comment | Babel.Comment | TSTree.Comment;
export type CallExpression =
  | ESTree.CallExpression
  | Babel.CallExpression
  | TSTree.CallExpression;
export type MemberExpression =
  | ESTree.MemberExpression
  | Babel.MemberExpression
  | TSTree.MemberExpression;
export type OptionalMemberExpression =
  | Babel.OptionalMemberExpression
  | TSTree.OptionalMemberExpression;
export type BindExpression = Babel.BindExpression;
export type Property = ESTree.Property | Babel.Property | TSTree.Property;
export type ClassPrivateProperty = Babel.ClassPrivateProperty;

export { ESTree, Babel, TSTree, NGTree };
