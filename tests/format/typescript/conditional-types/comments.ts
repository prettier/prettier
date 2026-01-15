type A = B extends T
  ? // comment
    foo
  : bar;

type T = any extends B
    // Comment
    // Multiline comment
    ? undefined | NonNullable<B>[foo]
    : B[foo];

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
