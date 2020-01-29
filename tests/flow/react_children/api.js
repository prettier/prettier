// @flow

import {Children, type ChildrenArray} from 'react';

const a: ChildrenArray<?number> = [
  1, null, 2, undefined,
  [3, null, 4, undefined, [5, null, 6, undefined]],
];

na(Children.map(a, (x: number) => (x: number))); // OK
na(Children.map(a, (x: string) => (x: string))); // Error
sa(Children.map(a, (x: number) => (x: number))); // Error

Children.forEach(a, (x: number) => {}); // Error
Children.forEach(a, (x: ?number) => {}); // OK
Children.forEach(a, (x: string) => {}); // Error

n(Children.count(a)); // OK
s(Children.count(a)); // Error

n(Children.only(a)); // OK
s(Children.only(a)); // Error

na(Children.toArray(a)); // OK
sa(Children.toArray(a)); // Error

function v(x: null) {}
function n(x: number) {}
function s(x: string) {}
function na(x: Array<number>) {}
function sa(x: Array<string>) {}
