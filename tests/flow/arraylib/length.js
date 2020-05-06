/* @flow */

declare var a: Array<number>;
a.length = 5;

declare var r: $ReadOnlyArray<number>;
r.length = 6; //ng

declare var t: [number];
t.length = 7; //ng
