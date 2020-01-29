// @flow

declare function invariant(): void;

declare var a: true;
invariant(a);

declare var b: false;
invariant(b);

declare var c: boolean;
invariant(c);
c ? invariant(c) : invariant(c);

declare var d: 0;
invariant(d);

declare var e: 1;
invariant(e);

declare var f: number;
invariant(f);

declare var g: false & true;
invariant(g);

declare var h: false | true;
invariant(h);
