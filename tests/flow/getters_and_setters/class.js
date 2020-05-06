/**
 * @flow
 */

var z: number = 123;

class Foo {
  get goodGetterNoAnnotation() { return 4; }
  get goodGetterWithAnnotation(): number { return 4; }

  set goodSetterNoAnnotation(x) { z = x; } // TODO: bad error position
  set goodSetterWithAnnotation(x: number) { z = x; }

  get propWithMatchingGetterAndSetter(): number { return 4; }
  set propWithMatchingGetterAndSetter(x: number) { }

  // The getter and setter need not have the same type - no error
  get propWithSubtypingGetterAndSetter(): ?number { return 4; }
  set propWithSubtypingGetterAndSetter(x: number) { }

  // The getter and setter need not have the same type - no error
  set propWithSubtypingGetterAndSetterReordered(x: number) { }
  get propWithSubtypingGetterAndSetterReordered(): ?number { return 4; }

  get propWithMismatchingGetterAndSetter(): number { return 4; }
  set propWithMismatchingGetterAndSetter(x: string) { } // doesn't match getter (OK)

  set [z](x: string) {}
  get [z](): string { return string; }
};

var foo = new Foo();

// Test getting properties with getters
var testGetterNoError1: number = foo.goodGetterNoAnnotation;
var testGetterNoError2: number = foo.goodGetterWithAnnotation;

var testGetterWithError1: string = foo.goodGetterNoAnnotation; // Error number ~> string
var testGetterWithError2: string = foo.goodGetterWithAnnotation; // Error number ~> string

// Test setting properties with getters
foo.goodSetterNoAnnotation = 123;
foo.goodSetterWithAnnotation = 123;

// TODO: Why does no annotation mean no error?
foo.goodSetterNoAnnotation = "hello"; // Error string ~> number
foo.goodSetterWithAnnotation = "hello"; // Error string ~> number

var testSubtypingGetterAndSetter: number = foo.propWithSubtypingGetterAndSetter; // Error ?number ~> number
