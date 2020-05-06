// @flow

type T = <A>((A) => mixed) => (A & A);
type fn = (arg: string) => number;
type arg = $Call<T, fn>;
const t: arg = 5;
