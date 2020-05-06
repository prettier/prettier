type MyType = {|
  +foo: number
|}

let x: $Shape<MyType> = {foo : 3}; //no error

let o = {};
o.p = 3;
let z:$Shape<typeof o> = {s : 4}; //no error

let o2 = {p : 4};
let z2:$Shape<typeof o2> = {s : 4}; // flow error

let z3:$Shape<Object> = {x : 3}; // no error


let z5:$Shape<any> = {x : 3}; // no error

let method = () => {
  return;
};
let z7 : $Shape<typeof method> = {m : 5, k : 5}; // no error

let a = [];
let z8 : $Shape<typeof a> = {y : 4}; // flow error

let n = 4;
let z9 : $Shape<number> = {x : 3}; // flow error

let s = "asdf";
let z11 : $Shape<string> = {x : 3}; // flow error

let o7 = {};
o7.p = 3;
let z13 : $Shape<typeof o7> = {p : "3"}; // no error
(z13.p : empty); //flow error

let z14 : $Shape<{}> = {p : 'foo'}; // flow error

type Props = {};
const React = require('react');

class MyComponent extends React.Component<Props, MyType> {
  state = this._createState();

  componentWillReceiveProps(nextProps: Props): void {
    this.setState(this._createState());
  }

  _createState(): MyType {
    return {
      foo: 3,
    };
  }
}

class A {
  +x : number = 3;
}

class B extends A {
  +y = 4;
}

class C extends B {
  +z : string = "4";
}

class Empt {}

let _a : $Shape<A> = { x : 4 }; // no error
let _b : $Shape<A> = { y : 4 }; // flow error
let _c : $Shape<B> = { x : 4 }; // no error
let _d : $Shape<B> = { y : "4" }; // no error
let _e : $Shape<B> = { z : 4 }; // flow error
let _f : $Shape<C> = { x : 4 }; // no error
let _g : $Shape<C> = { y : "4" }; // no error
let _h : $Shape<C> = { z : "4" }; // no error
let _i : $Shape<C> = { a : 4 }; // flow error
let _j : $Shape<Empt> = {}; // no error
let _k : $Shape<Empt> = { x : 4 }; // flow error

let a_inst : A = new A;
let b_inst : B = new B;
let c_inst : C = new C;

class D {
  m : A = a_inst;
  n : B = b_inst;
}

let _l : $Shape<D> = {m : a_inst, n : a_inst}; // flow error
let _m : $Shape<D> = {m : b_inst, n : b_inst}; // no error
let _n : $Shape<D> = {m : c_inst, n : c_inst}; // no error
