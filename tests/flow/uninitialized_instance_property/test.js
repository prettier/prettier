/* @flow */

/* EXPECTED TO ERROR */

class E1 {
  p: number; // PropertyNotDefinitelyInitialized
}

class E2 {
  p1: number; // PropertyNotDefinitelyInitialized
  p2: number; // PropertyNotDefinitelyInitialized
}

class E3 {
  #priv: boolean; // PropertyNotDefinitelyInitialized
}

class E4 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) return;
    this.p = 0;
  }
}

class E5 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) throw "";
    this.p = 0;
  }
}

class E6 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    {
      if (true) return;
      this.p = 0;
    }
  }
}

class E7 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    {
      if (true) throw "";
      this.p = 0;
    }
  }
}


class E8 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) {
      return;
    }
    this.p = 0;
  }
}

class E9 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) {
      throw "";
    }
    this.p = 0;
  }
}

class E10 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) {
      this.p = 0;
      return;
    }
  }
}

class E11 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    for (;;) {
      return;
    }
    this.p = 0;
  }
}

class E12 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) {
      for (;;) {
        return;
      }
      this.p = 0;
    } else {
      this.p = 0;
    }
  }
}

class E13 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) continue;
      this.p = 0;
    } while (true);
  }
}

class E14 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) break;
      this.p = 0;
    } while (true);
  }
}


class E15 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) return;
      this.p = 0;
    } while (true);
  }
}

class E16 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) throw "";
      this.p = 0;
    } while (true);
  }
}

class E17 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p += 3; // ReadFromUninitializedProperty
  }
}

class E18 {
  p: string; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p; // ReadFromUninitializedProperty
  }
}

class E19 {
  p: null; // PropertyNotDefinitelyInitialized
  constructor() {
    const x = this.p; // ReadFromUninitializedProperty
  }
}

class E20 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (this.p === 0) false; // ReadFromUninitializedProperty
  }
}

class E21 {
  p: number;
  constructor() {
    this.p; // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E22 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p++; // ReadFromUninitializedProperty
  }
}

class E23 {
  p: number;
  constructor() {
    this.p++; // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E24 {
  constructor() {
    let x: number;
    let y: number = x; // ExpectError uninitialized variable is incompatible with number
  }
}

class E25 {
  p: number;
  constructor() {
    let x: number;
    this.p = x; // ExpectError uninitialized variable is incompatible with number
  }
}

class E26 {
  p: E26;
  constructor() {
    this.p = this; // ThisBeforeEverythingInitialized
  }
}

class E27 {
  p: number;
  constructor() {
    if (this) {} // ThisBeforeEverythingInitialized
    this.p = 0;
  }
}

function f(o) {}
class E28 {
  p: number;
  constructor() {
    f(this); // ThisBeforeEverythingInitialized
    this.p = 0;
  }
}

class E29 {
  p: number;
  constructor() {
    const x = this; // ThisBeforeEverythingInitialized
    this.p = 0;
  }
}

class E30 {
  p: number;
  constructor() {
    this.m(); // MethodCallBeforeEverythingInitialized
    this.p = 0;
  }
  m(): void {}
}

class E31 {
  p1;
  p2: number;
  constructor() {
    this.p1 = 0;
    this.m(); // MethodCallBeforeEverythingInitialized
    this.p2 = 0;
  }
  m(): void {}
}

class E32 {
  p1: number; // PropertyNotDefinitelyInitialized
  p2;
  constructor() {
    this.p2 = 0;
  }
}

class E33 {
  p;
  #p: "a"; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p = 0;
  }
}

class E34 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    if (true) {
      this.p = 0;
    } else if (false) {
      this.p = 0;
    }
  }
}

class E35 {
  p: true;
  constructor() {
    this.p = this.p; // ReadFromUninitializedProperty
  }
}

class E36 {
  p: {x: number}; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p.x = 0; // ReadFromUninitializedProperty
  }
}

class E37 {
  p1: number; // PropertyNotDefinitelyInitialized
  p2;
  constructor() {
    while (this.p2 = this.p1) { // ReadFromUninitializedProperty
      this.p1 = 0;
    }
  }
}

class E38 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {}
}

class E39 {
  p1: number;
  p2: number;
  constructor() {
    this.p1 = this.p2; // ReadFromUninitializedProperty
    this.p2 = this.p1;
  }
}

class E40 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    switch (4) {
      case 0:
      case 1:
        if (true) {
          break;
        }
      default:
        this.p = 6;
        break;
    }
  }
}


class E41 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    switch (0) {
      case 0:
        this.p = 0;
        break;
      case 1:
        this.p = 0;
        break;
    }
  }
}

class E42 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    switch (0) {
      case 0:
        break;
      default:
        this.p = 0;
        break;
    }
  }
}

class E43 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    while (false) {
      this.p = 1;
    }
  }
}

class E44 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    for (;;) {
      this.p = 1;
      break;
    }
  }
}

class E45 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    let p: number;
    p = 10;
  }
}

class E46 {
  p: 0; // PropertyNotDefinitelyInitialized
  constructor() {
    label: {
      if (true) {
        break label;
      }
      this.p = 0;
    }
  }
}

class E47 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) {
        continue;
      }
      this.p = 0;
    } while (false);
  }
}

class E48 {
  p: 0.; // PropertyNotDefinitelyInitialized
  constructor() {
    do {
      if (true) {
        break;
      }
      this.p = 0;
    } while (false);
  }
}

class E49 {
  p: number;
  constructor() {
    while (true) {
      this.p; // ReadFromUninitializedProperty
      break;
    }
    this.p = 0;
  }
}

class E50 {
  p: number;
  constructor() {
    if (true) {
      this.p; // ReadFromUninitializedProperty
    }
    this.p = 0;
  }
}

class E51 {
  p1: number;
  p2;
  constructor() {
    const a = (this.p2 = this.p1), // ReadFromUninitializedProperty
          b = (this.p1 = 0);
  }
}

class E52 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    const f = () => {
      this.p = 0;
    };
  }
}

class E53 {
  p: number; // PropertyNotDefinitelyInitialized
  constructor() {
    function f() {
      this.p = 0;
    }
  }
}

class E54 {
  p: number;
  constructor() {
    this.m(this); // MethodCallBeforeEverythingInitialized, ThisBeforeEverythingInitialized
    this.p = 0;
  }
  m(o): void {}
}

class E55 {
  p: number;
  constructor() {
    this.m(this.p); // MethodCallBeforeEverythingInitialized, ReadFromUninitializedProperty
    this.p = 0;
  }
  m(x): void {}
}

class E56 {
  p: number;
  constructor() {
    this.m(this.m(0)); // MethodCallBeforeEverythingInitialized, MethodCallBeforeEverythingInitialized
    this.p = 0;
  }
  m(x): number {
    return x;
  }
}

class E57 {
  p: number;
  constructor() {
    this.m(this.p = 0); // MethodCallBeforeEverythingInitialized
  }
  m(x): number {
    return x;
  }
}

class E58 {
  p: number | string; // PropertyNotDefinitelyInitialized
}

class E59 {
  p: void & number; // PropertyNotDefinitelyInitialized
}

class E60<T> {
  p: T; // PropertyNotDefinitelyInitialized
}

class E61 {
  p: {x: number}; // PropertyNotDefinitelyInitialized
  constructor() {
    this.p.x; // ReadFromUninitializedProperty
  }
}

class E62 {
  p; // PropertyNotDefinitelyInitialized
  constructor() {
    (this.p: string); // ReadFromUninitializedProperty
  }
}

class E63 {
  #p; // PropertyNotDefinitelyInitialized
  constructor() {
    (this.#p: string); // ReadFromUninitializedProperty
  }
}

function incr(x: number) {
  return x + 1;
}
class E64 {
  p;
  constructor() {
    incr(this.p); // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E65 {
  #p;
  constructor() {
    incr(this.#p); // ReadFromUninitializedProperty
    this.#p = 0;
  }
}

class E66 {
  p;
  constructor() {
    const x: number = this.p; // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E67 {
  #p;
  constructor() {
    const x: number = this.#p; // ReadFromUninitializedProperty
    this.#p = 0;
  }
}

class E68 {
  #p1; // PropertyNotDefinitelyInitialized
  p2: boolean;
  constructor() {
    this.p2 = true;
    this.m(); // MethodCallBeforeEverythingInitialized
  }
  m() { return this.#p1 }
}
const x_E68: number = (new E68()).m();

class E69 {
  p; // PropertyNotDefinitelyInitialized
  constructor() {
    this.m(this.p); // MethodCallBeforeEverythingInitialized, ReadFromUninitializedProperty
  }
  m(x: boolean) { return !x; }
}

class E70 {
  p;
  constructor() {
    this; // ThisBeforeEverythingInitialized
    (this.p: number); // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E71 {
  f;
  q: number;
  constructor() {
    this.f = () => {};
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

class E72 {
  p: number;
  constructor() {
    let f = () => this.p++; // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E73 {
  p: number;
  constructor() {
    (() => this.p++)(); // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E74 {
  p = 0;
  f;
  q: number;
  constructor() {
    this.f = () => this.p++;
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

class E75 {
  p: number;
  f;
  constructor() {
    this.f = x => this.p += x;
    this.f(this.f()); // PropertyFunctionCallBeforeEverythingInitialized, PropertyFunctionCallBeforeEverythingInitialized
    this.p = 0;
  }
}

class E76Parent {
  f: () => number;
  p: number;
  constructor() {
    this.f = () => 0;
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.p = 0;
  }
}
class E76Child extends E76Parent {
  f = () => this.p;
  constructor() {
    super();
  }
}

class E77 {
  p1: number;
  p2: number = this.p1; // ReadFromUninitializedProperty
  constructor() {
    this.p1 = 0;
  }
}

class E78 {
  p1: number;
  #p2: number = this.p1; // ReadFromUninitializedProperty
  constructor() {
    this.p1 = 0;
  }
}

class E79 {
  p: number = this.m(); // MethodCallBeforeEverythingInitialized
  constructor() {}
  m(): number { return 0; }
}

class E80 {
  p: number = this.m(); // MethodCallBeforeEverythingInitialized
  m(): number { return 0; }
}

class E81 {
  p = this; // ThisBeforeEverythingInitialized
}

class E82 {
  p: number;
  f = () => this.p++;
  constructor() {
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.p = 0;
  }
}

class E83 {
  p: number;
  constructor() {
    let f = () => this.p++; // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E84 {
  p: number;
  constructor() {
    (() => this.p++)(); // ReadFromUninitializedProperty
    this.p = 0;
  }
}

class E85 {
  f = () => {};
  q: number;
  constructor() {
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

class E86 {
  p = 0;
  f = () => this.p++;
  q: number;
  constructor() {
    this.f(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

class E87 {
  p: number;
  f = x => this.p += x;
  constructor() {
    this.f(this.f()); // PropertyFunctionCallBeforeEverythingInitialized, PropertyFunctionCallBeforeEverythingInitialized
    this.p = 0;
  }
}

class E88 {
  p = 0;
  constructor() {
    this.p(); // ExpectError Cannot call `this.p` because number is not a function.
  }
}

class E89 {
  p = () => "property function";
  p() {
    return "method";
  }
  q: number;
  constructor() {
    this.p(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

class E90 {
  p() {
    return "method";
  }
  p = () => "property function";
  q: number;
  constructor() {
    this.p(); // PropertyFunctionCallBeforeEverythingInitialized
    this.q = 0;
  }
}

/* EXPECTED TO NOT ERROR */

class P1 {
  p: number = 0;
}

class P2 {
  p: number = 0;
}

class P3 {
  #priv: number = 0;
}

class P4 {
  constructor() {
    return;
  }
}

class P5 {
  constructor() {
    throw "";
  }
}

class P6 {
  p: number;
  constructor() {
    this.p = 0;
    this.p += 3;
  }
}

class P7 {
  p: number;
  constructor() {
    this.p = 0;
    this.p++;
  }
}

class P8 {}

class P9 {
  p: number;
  constructor() {
    this.p = 0;
  }
}

class P10 {
  #priv: number;
  constructor() {
    this.#priv = 0;
  }
}

class P11 {
  p1: number = 0;
  p2: number;
  constructor() {
    this.p2 = this.p1;
  }
}

function g() {}
class P12 {
  p: number;
  constructor() {
    g();
    this.p = 0;
  }
}

class P13 {
  p: number;
  constructor() {
    if ((this.p = 0)) {}
  }
}

class P14 {
  p: number;
  constructor() {
    if (true) {
      this.p = 0;
    } else {
      this.p = 0;
    }
  }
}

class P15 {
  p: number;
  constructor() {
    if (true) {
      this.p = 0;
    } else if (false) {
      this.p = 0;
    } else {
      this.p = 0;
    }
  }
}

class P16 {
  p: number;
  constructor() {
    if (true) {
      this.p = 0;
    } else if (false) {
      if (false) {
        this.p = 0;
      } else {
        this.p = 0;
      }
    } else {
      this.p = 0;
    }
  }
}


class P17 {
  p1: number;
  p2: number;
  constructor() {
    this.p1 = this.p2 = 0;
  }
}

class P18 {
  p: number;
  constructor() {
    this.p = 0;
    const x = this.p;
  }
}

class P19 {
  p1: number;
  p2: number;
  constructor() {
    do {
      this.p1 = 0;
    } while (this.p2 = this.p1);
  }
}

class ParentP20 {
  p: number;
  constructor() {
    this.p = 0;
  }
}
class P20 extends ParentP20 {
  constructor() {
    super();
  }
}

class ParentP21 {
  p: number;
  constructor() {
    this.p = 0;
  }
}
class P21 extends ParentP21 {
}

class P22 {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  constructor() {
    if ((this.p1 = 1) != null) {}
    while ((this.p2 = 2) != null) {}
    for (; (this.p3 = 3) != null;) {}
    for (this.p4 = 4;;) {}
  }
}

class P23 {
  p: number;
  constructor() {
    do {
      this.p = 0;
    } while (false);
  }
}

function somethingThatThrows(): void { throw "the football"; }
class P24 {
  p: number;
  constructor() {
    try {
      this.p = 0;
      somethingThatThrows();
    } catch (err) {
      this.p = 0;
    }
  }
}

class P25 {
  p: number;
  constructor() {
    try {
      somethingThatThrows();
    } catch (err) {
      // do some stuff to handle the error
    } finally {
      this.p = 0;
    }
  }
}

class P26 {
  p1: number;
  p2: number;
  constructor() {
    const a = (this.p1 = 0),
          b = (this.p2 = this.p1);
  }
}

class P27 {
  p1: number;
  p2: number;
  constructor() {
    do {
      this.p1 = 0;
    } while (this.p2 = this.p1);
  }
}

class P28 {
  constructor() {
    this;
  }
}

class P29 {
  constructor() {
    this.m();
  }
  m(): void {}
}


class P30 {
  p: number;
  constructor() {
    this.p = 0;
    if (this) {}
  }
}

class P31 {
  p: number;
  constructor() {
    this.p = 0;
    this.m();
  }
  m(): void {}
}

class P32 {
  p: number;
  constructor() {
    this.p = 0;
    const x = this;
  }
}

class P33 {
  p: void;
}

class P34 {
  p: void;
  constructor() {}
}

class P35 {
  p: ?number;
}

class P36 {
  p: ?number;
}

class P37 {
  p;
}

class P38 {
  p;
  constructor() {}
}

class P39<T: void> {
  p: T; // TODO spurious error
}

class P40 {
  p; // TODO spurious error
  constructor() {
    (this.p: void); // TODO spurious error
  }
}

class P41 {
  p: string | void;
}

class P42 {
  p: void & ?number;
}

class P43 {
  #p: void;
}

class P44 {
  #p: void;
  constructor() {}
}

class P45 {
  #p: ?number;
}

class P46 {
  #p: ?number;
}

class P47 {
  #p;
}

class P48 {
  #p;
  constructor() {}
}

class P49 {
  p: void;
  constructor() {
    this.p;
  }
}

class P50 {
  p: ?number;
  constructor() {
    this.p;
  }
}

class P51 {
  p; // TODO spurious error
  constructor() {
    this.p; // TODO spurious error
  }
}

class P52 {
  #p; // TODO spurious error
  constructor() {
    this.#p; // TODO spurious error
  }
}

class P53 {
  p;
  constructor() {
    this;
  }
}

class P54 {
  p1;
  #p2: boolean;
  constructor() {
    this.#p2 = true;
    this;
  }
}

class P55 {
  #p1; // TODO spurious error
  p2: boolean;
  constructor() {
    this.p2 = true;
    this.m(); // TODO spurious error
  }
  m() { return this.#p1 }
}

class P56 {
  p: number;
  f;
  constructor() {
    this.f = () => this.p++;
    this.p = 0;
  }
}

class P57 {
  p: number;
  f: () => number;
  constructor() {
    this.f = () => this.p++;
    this.p = 0;
    this.f();
  }
}

class P58 {
  f: () => boolean;
  constructor() {
    let b = true;
    this.f = () => {
      if (b) {
        b = false;
        return this.f();
      }
      return b;
    }
  }
}

class P59 {
  isEven: number => boolean;
  isOdd: number => boolean;
  constructor() {
    this.isEven = x => x === 0 ? true : this.isOdd(x - 1);
    this.isOdd = x => x === 0 ? false : this.isEven(x - 1);
  }
}

class P60 {
  p: number;
  f = () => this.p++;
  constructor() {
    this.p = 0;
    this.f();
  }
}

class P61 {
  p: number = 0;
  constructor() {
    this;
  }
}

class P62 {
  p: number = 0;
  constructor() {
    this.m();
  }
  m() {}
}

class P63 {
  p1: number;
  p2 = this.p1 = 0;
}

class P64 {
  constructor() {
    this.p;
  }
  p = 0;
}

// https://github.com/facebook/flow/issues/8037
declare function P65_a<F>(b: F): F & {};
class P65 {
  b = P65_a(this.b);
}
