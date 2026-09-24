// @flow

type Greeting = `hello ${string}`;
type PoorlySpaced=`value:${ string|number }`;
type Long = `prefix-${AReallyLongTypeNameThatForcesTheInterpolationToWrap | AnotherReallyLongTypeNameThatAlsoForcesWrapping}-suffix`;
type Commented = `before-${/* before */ string | number /* after */}-after`;
type Nested = (`left-${string}` | `right-${number}`) & string;
type InObject = { value: `kind-${"a" | "b"}` };
