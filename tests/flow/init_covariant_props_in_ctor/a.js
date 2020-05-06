// @flow


class A {
  +prop: number;

  constructor(prop: number) {
    this.prop = prop;         // OK
  }
}

const a = new A(1);
a.prop = 2;                   // ERROR: Cannot assign outside of ctor to + prop

class B {
  +prop: number;
  m() {};

  constructor(prop: string) {
    this.prop = prop;         // ERROR: we should not be assigning a string here
    this.m = () => {};        // ERORR: cannot assign method
  }
}

class C {
  -prop: number;

  constructor(prop: number) {
    this.prop = prop;         // OK
  }
}

class D {
  prop: number;

  constructor(prop: number) {
    this.prop = prop;         // OK
  }
}

class E {
  +prop: number;

  constructor(prop: number) {
    this.prop = prop;         // OK
    const f = () => {
      this.prop = prop;       // ERROR: the initilized object can only be
                              //        assigned a property in the constructor
                              //        scope
    };
    function g() {
      this.prop = "";         // OK: this is bound to function containing object
    };
    const t = {
      prop: 1,
      n() { this.prop = 1; }  // OK
    };
  }

  m() {
    this.prop = 1;            // ERROR
  }
}

class F extends A {
  constructor(prop: number) {
    super(prop);
    this.prop = prop;         // OK
    this.prop = prop;
    this.prop = "";           // ERROR
  }
}

class G extends F {
  -prop: number               // ERROR: Was covariant in F and A
  constructor(prop: number) {
    super(prop);
    this.prop = prop;         // OK
    this.prop = prop;
  }
}
