/**
 * Test strict type param arity checking.
 *
 * Full type argument lists are required in type expressions,
 * such as type annotations and interface extends clauses.
 * Type arguments are optional in value expressions, such as
 * class extends clauses and calls of polymorphic functions.
 *
 * @flow
 */

// arity error in type annotation using polymorphic class

class MyClass<T> {
  x: T;
  constructor(x: T) {
    this.x = x;
  }
}

var c: MyClass = new MyClass(0); // error, missing argument list (1)

// arity error in type annotation using polymorphic class with defaulting

class MyClass2<T, U = string> {
  x: T;
  y: U;
  constructor(x: T, y: U) {
    this.x = x;
    this.y = y;
  }
}

var c2: MyClass2 = new MyClass2(0, ""); // error, missing argument list (1-2)

// arity error in type annotation using polymorphic type alias

type MyObject<T> = {
  x: T;
}

var o: MyObject = { x: 0 }; // error, missing argument list

// arity error in type alias rhs

type MySubobject = { y: number } & MyObject; // error, missing argument list

// arity error in interface extends

interface MyInterface<T> {
  x: T;
}

interface MySubinterface extends MyInterface { // error, missing argument list
  y: number;
}

// arity error in extends of polymorphic class

class MySubclass extends MyClass { // error, missing argument list
  y: number;
  constructor(y: number) {
    super(y);
  }
}

class MyClass3<X, Y = void> { }

class MySubclass2 extends MyClass3 { } // error, missing argument list

// *no* arity error in call of polymorphic function

function singleton<T>(x: T):Array<T> { return [x]; }

var num_array:Array<number> = singleton(0); // ok, type arg inferred

// empty type args lead to arity errors

var poly: MyClass<> = new MyClass; // error, too few arguments

class MyClass4 { }

var mono: MyClass4<> = new MyClass4; // error, class is not polymorphic
