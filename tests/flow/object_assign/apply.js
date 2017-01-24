// @flow

(Object.assign.apply(null, [{}, {a: 1}, {b: 'foo'}]): {a: number, b: string});
(Object.assign({}, ...[{a: 1}, {b: 'foo'}]): {a: number, b: string});
