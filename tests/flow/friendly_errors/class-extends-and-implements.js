/**
 * @format
 * @flow
 */

class A {
  p: number;
}

class B<T> {
  p: number;
}

class C extends A {
  p: string;
}

class D extends B<empty> {
  p: string;
}

interface E {
  p: number;
}

interface F<T> {
  p: number;
}

class G implements E {
  p: string;
}

class H implements F<empty> {
  p: string;
}

interface I {
  p: number;
}

interface J<T> {
  p: number;
}

interface K extends I {
  p: string;
}

interface L extends J<empty> {
  p: string;
}

interface M1 {
  p1: number;
}

interface M2 {
  p2: number;
}

interface N1<T> {
  p1: number;
}

interface N2<T> {
  p2: number;
}

interface O extends M1, M2 {
  p1: string;
  p2: string;
}

interface P extends N1<empty>, N2<empty> {
  p1: string;
  p2: string;
}

interface Q1 {
  p1: string;
}

interface Q2 {
  p2: string;
}

interface R1<T> {
  p1: string;
}

interface R2<T> {
  p2: string;
}

class S implements Q1, Q2 {
  p1: number;
  p2: number;
}

class T implements R1<empty>, R2<empty> {
  p1: number;
  p2: number;
}
