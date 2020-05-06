/**
 * @flow
 */

var z: number = 123;

class A {}
class B extends A {}
class C extends A {}

export type T = {
  get goodGetterWithAnnotation(): number,
  set goodSetterWithAnnotation(x: number): void,

  get propWithMatchingGetterAndSetter(): number,
  set propWithMatchingGetterAndSetter(x: number): void,

  // The getter and setter need not have the same type
  get propWithSubtypingGetterAndSetter(): ?number, // OK
  set propWithSubtypingGetterAndSetter(x: number): void,

  set propWithSubtypingGetterAndSetterReordered(x: number): void, // OK
  get propWithSubtypingGetterAndSetterReordered(): ?number,

  get exampleOfOrderOfGetterAndSetter(): A,
  set exampleOfOrderOfGetterAndSetter(x: B): void,

  set exampleOfOrderOfGetterAndSetterReordered(x: B): void,
  get exampleOfOrderOfGetterAndSetterReordered(): A,
};
