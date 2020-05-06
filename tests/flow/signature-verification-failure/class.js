// @flow

export class A {
  // Ast.Expression.Object.Property.Identifier
  x = 1;

  // Ast.Expression.Object.Property.Literal
  'b' = 5;

  // Ast.Expression.Object.Property.PrivateName
  #m = 2;

  // Ast.Expression.Object.Property.Computed
  ['a'] = 3;
  ['a' + 'b'] = 4;

}
