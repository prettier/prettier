const it: Iterable<number> = [7,8,9];
[...it]; // Error
f(...it); // Error
f.bind(null, ...it); // Error
if (Array.isArray(it)) {
  [...it]; // No error
  f(...it); // No error
  f.bind(null, ...it); // No error
}

import {opaqueIterable as oit} from './opaque';
[...oit]; // Error
f(...oit); // Error
f.bind(null, ...oit); // Error
if (Array.isArray(oit)) {
  [...oit]; // No error
  f(...oit); // No error
  f.bind(null, ...oit); // No error
}

function f(...args) {}
