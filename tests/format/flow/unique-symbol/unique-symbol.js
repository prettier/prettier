// @flow

type Unique = unique symbol;
declare const declared: unique symbol;
const regular: unique symbol = Symbol("regular");
type Union = unique symbol | string;
type Intersection = unique symbol & Marker;

type BlockCommented = unique /* between unique and symbol */ symbol;
type LineCommented = unique // between unique and symbol
symbol;
