type A = test extends B
  // ?
  // comment
  ? foo
  : bar;

type A = test extends B
  /* comment
     comment
     comment
     comment */
  ? foo
  : bar;

type A = test extends B
  // ?
  // comment
  ? foo
  : test2 extends C
  // comment
  // comment
  ? foo
  : bar;

type B  = test extends B
  /* comment
     comment
     comment
     comment */
  ? foo
  : test2 extends C
  /* comment
     comment
     comment */
  ? foo
  : bar;

type A = B extends test ?
  // comment
  foo
  : bar;

type A = B extends test ?
  // comment
  first
  : B extends test
  // comment
  ? first
  : second;
