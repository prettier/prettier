// @flow

let y = { FOO: 'foo' };
if (y.FOO) {}
if (y.FOO == '') {}
if (y.FOO === '') {}
if (y.FOO == null) {}
if (y.FOO == undefined) {}
if (Array.isArray(y.FOO)) {}
