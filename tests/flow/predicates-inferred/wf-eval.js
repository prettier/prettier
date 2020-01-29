// @flow

function f1(x: string): $Call<<V>(V) => V, string> %checks { return x; } // okay
function f2(x: string): $Call<<V>(V) => V, $Call<<V>(V) => V, string>> %checks { return x; } // okay
function f3<V>(x: V): $Call<<V>(V) => V, V> %checks { return x; } // error
