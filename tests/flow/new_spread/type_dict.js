declare class T {}
declare class U {}

declare var o1: {...{[string]:T},...{p:U}}; // Error, can't spread because inexact may clash with T
(o1: {p?:T|U,[string]:T});

