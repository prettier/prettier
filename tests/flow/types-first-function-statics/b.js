// @flow

const a = require('./a');

(a: () => void);
(a.x: number);
(a.x: string);
(a.other: number);

const poly_a = require('./poly_a');

(poly_a: () => void);
(poly_a: <T>() => void);
(poly_a.x: number);
(poly_a.x: string);
(poly_a.other: number);
