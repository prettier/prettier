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
