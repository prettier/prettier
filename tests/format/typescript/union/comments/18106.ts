export interface DirectiveArgumentNode1 extends ArrayExpression {
  elements: // dir, exp, arg, modifiers
    | [string]
    | [string, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode, ObjectExpression]
}

export class DirectiveArgumentNode12 extends ArrayExpression {
  elements: // dir, exp, arg, modifiers
    | [string]
    | [string, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode, ObjectExpression]
  = 1
}

type A = // dir, exp, arg, modifiers
  | [string]
  | [string, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode, ObjectExpression]

const elements: // dir, exp, arg, modifiers
  | [string]
  | [string, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode, ObjectExpression]
  = 1

export interface DirectiveArgumentNode2 extends ArrayExpression {
  elements: /* block comment */
    | [string]
    | [string, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode, ObjectExpression]
}

export class DirectiveArgumentNode22 extends ArrayExpression {
  elements: /* block comment */
    | [string]
    | [string, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode, ObjectExpression]
  = 1
}

type A2 = /* block comment */
  | [string]
  | [string, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode, ObjectExpression]

const elements2: /* block comment */
  | [string]
  | [string, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode]
  | [string, ExpressionNode, ExpressionNode, ObjectExpression]
  = 1
