/* @flow */

declare var compose: $Compose;
declare var fns1: Iterable<(number) => number>;

(compose(
  ...fns1, // Error
)(42));

if (Array.isArray(fns1)) {
  (compose(
    ...fns1, // No error
  )(42));
}
