type Foo = Bar extends Huga
  // ?
  // comment
  ? Bar
  : Huga;

type Foo = Bar extends Huga ?
  // ?
  // comment
  Bar
  : Huga;
