/* @flow */

let x = 0;
if (x == null) {}
if (x == undefined) {}
if (Array.isArray(x)) {}

let y = { FOO: 'foo' };
if (y.FOO) {}
if (y.FOO == '') {}
if (y.FOO === '') {}
if (y.FOO == null) {}
if (y.FOO == undefined) {}
if (Array.isArray(y.FOO)) {}
