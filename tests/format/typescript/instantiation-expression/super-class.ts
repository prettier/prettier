  class ClassDeclaration_1 extends B<T> {}
( class ClassExpresssion_1 extends B<T> {} );
  class ClassDeclaration_2 extends (B<T>) {}
( class ClassExpresssion_2 extends (B<T>) {} );

// This not really make sense
// https://github.com/typescript-eslint/typescript-eslint/issues/12012
  class ClassDeclaration_3 extends (B<T>)<T> {}
( class ClassExpresssion_3 extends (B<T>)<T> {} );
