// @flow

declare var compose: $Compose;
declare var composeReverse: $ComposeReverse;

(compose(n => n.toString())(42): empty); // Error: string ~> empty

(composeReverse(n => n.toString())(42): empty); // Error: string ~> empty

(compose(
  n => n * 5, // Error: string cannot be multiplied.
  n => n.toString(),
)(42): empty); // Error: number ~> empty

(composeReverse(
  n => n * 5, // OK
  n => n.toString(),
)(42): empty); // Error: string ~> empty
