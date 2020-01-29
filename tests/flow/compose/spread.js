// @flow

declare var compose: $Compose;
declare var fns1: Array<(number) => number>;
declare var fns2: Array<(number) => string>;
declare var fns3: Array<<O>(O) => $PropertyType<O, 'p'>>;

(compose(
  ...fns1,
)(42): empty); // Error: number ~> empty

(compose(
  ...fns1, // Error: string ~> number
)('foo'): empty); // Error: string ~> empty and number ~> empty

(compose(
  ...fns2, // Error: string ~> number
)(42): empty); // Error: number ~> empty and string ~> empty

const x1 = { p: { p: { p: { p: 42 } } } };
(compose(
  ...fns3, // Error: Cannot get p on number
)(x1): empty); // Error: number ~> empty and object ~> empty

type X2 = { p: X2 };
declare var x2: X2;
((compose(
  ...fns3,
))(x2): empty); // Error: object ~> empty
