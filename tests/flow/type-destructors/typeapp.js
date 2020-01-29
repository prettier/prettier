// @flow

type X<A, B> = A | B;

(42: $NonMaybeType<number | string>); // Ok
(42: $NonMaybeType<X<number, string>>); // Ok

// Create a tvar that is not resolved or even 0->1 in an annotation!
// Technically, this specific tvar is 0->1, but is not optimized to a Resolved
// tvar in the implementation. But it is trivial to create an example where the
// tvar is not 0->1.
type _ItemType<T, _U: $ReadOnlyArray<T>> = T;
type $ItemType<A: $ReadOnlyArray<mixed>> = _ItemType<*, A>;
type Y = $NonMaybeType<$ItemType<$ReadOnlyArray<?number>>>;
declare var y: Y;
(y: number); // Ok
(42: Y); // Ok
