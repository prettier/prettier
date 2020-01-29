// @flow

const React = require("React");

declare opaque type O<T>;
type Mono = { m: number };
type Poly<X> = { f: X };

declare function mapUnion<TNext>(fn: O<TNext> | TNext): TNext;
declare function map<TNext>(fn: TNext): TNext;

declare var p: Poly<number>;
const p1 = mapUnion(p);
const p2 = map(p);

declare var m: Mono;
const m1 = mapUnion(m);
const m2 = map(m);

declare var J: any;
const j1 = mapUnion(<J/>);
const j2 = map(<J/>);
