// @flow

const a = require('./a');

(a: () => void);
(a.g: string);
(a.g: number);
(a.other: string);

const poly_a = require('./poly_a');

(poly_a: () => void);
(poly_a: <T>() => void);
(poly_a.g: string);
(poly_a.g: number);
(poly_a.other: string);
