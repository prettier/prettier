// @flow

const typed = require('./typed/foo');
const untyped = require('./untyped/foo');

(typed: number); // error: string ~> number
(untyped: number); // no error, `untyped` is `any`

const nonexistent = require('./untyped/bogus'); // error, missing module
