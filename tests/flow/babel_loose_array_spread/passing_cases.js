// No errors are expected in this file.

import {opaqueReadOnlyArray, opaqueDerivedReadOnlyArray} from './opaque';

[...[1,2,3]];
const a: Array<number> = [4,5,6];
[...a];
f(...a);
[...a.map(x => x + 1)];
f(...a.map(x => x + 1));
const b: [number, string] = [42, "foo"];
[...b];
f(...b);
f.apply(null, b);
f.bind(null, ...b);

function f(...args) {}

declare var compose: $Compose;
compose(...[x => x, x => x]);

const c: $ReadOnlyArray<number> = [4,5,6];
[...c];
f(...c);
[...c.map(x => x + 1)];
f(...c.map(x => x + 1));

[...opaqueReadOnlyArray];
f(...opaqueReadOnlyArray);
[...opaqueReadOnlyArray.map(x => x + 1)];
f(...opaqueReadOnlyArray.map(x => x + 1));

[...opaqueDerivedReadOnlyArray];
f(...opaqueDerivedReadOnlyArray);
[...opaqueDerivedReadOnlyArray.map(x => x + 1)];
f(...opaqueDerivedReadOnlyArray.map(x => x + 1));
