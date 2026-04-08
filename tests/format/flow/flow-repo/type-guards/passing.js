// @flow

type F = (x: mixed) => x is A;

function f(any): x is A { return true; }

const arrow0 = (x: any): x is A => true;
const arrow1 = (x: any): x is (y: A) => B => true;
const arrow3 = (x: any): x is (y: A) => y is B => true;

const needs_parens_1 = (x: any): x is (A => B) => true;
const needs_parens_2 = (x: any): x is ((A) => B) => true;
const needs_parens_3 = (x: any): x is (A => x is B) => true;
const needs_parens_4 = (x: any): x is (A => x is B => x is C) => true;

const needs_parens_5 = (x: any): x is (y: A) => (B => C) => true;
const needs_parens_6 = (x: any): x is (y: A) => y is (B => C) => true;

class C {
  m(): this is D {}
  f = (): this is D => {}
}

function asserts_1(x: any): asserts x {}
function asserts_2(x: any): asserts x is A {}
