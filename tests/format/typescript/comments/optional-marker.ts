function untyped(a/*c*/?) {}

function typed(a/*c*/?: number) {}

class A {
  method(a/*c*/?) {}
}

const arrow = (a/*c*/?) => a;

interface I {
  property/*c*/?: number;
  method/*c*/?(): void;
}

function lineComment(
  a // c
  ?
) {}
