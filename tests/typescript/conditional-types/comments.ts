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
type A = B extends T
  ? // comment
    foo
  : bar;

type A = B extends test /* comment
  comment
      comment
*/
  ? foo
  : bar;

type T = test extends B
  ? /* comment
          comment
    comment
          comment
  */
    foo
  : bar;

type T = test extends B
  ? /* comment
       comment
       comment
       comment
    */
    foo
  : test extends B
  ? /* comment
  comment
    comment */
    foo
  : bar;

type T = test extends B
  ? /* comment */
    foo
  : bar;

type T = test extends B
  ? foo
  : /* comment
         comment
     comment
           comment
    */
  bar;

type T = test extends B
  ? foo
  : /* comment
         comment
     comment
           comment
    */
  test extends B
  ? foo
  : /* comment
  comment
    comment
   */
    bar;

type T = test extends B
  ? foo
  : /* comment */
  bar;

type T = test extends B ? test extends B /* c
c */? foo : bar : bar;
