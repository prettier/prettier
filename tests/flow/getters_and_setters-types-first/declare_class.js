/**
 * @flow
 */

var z: number = 123;

declare class Foo {
  get goodGetterWithAnnotation(): number;
  set goodSetterWithAnnotation(x: number): void;

  get propWithMatchingGetterAndSetter(): number;
  set propWithMatchingGetterAndSetter(x: number): void;

  // The getter and setter need not have the same type - no error
  get propWithSubtypingGetterAndSetter(): ?number;
  set propWithSubtypingGetterAndSetter(x: number): void;

  // The getter and setter need not have the same type - no error
  set propWithSubtypingGetterAndSetterReordered(x: number): void;
  get propWithSubtypingGetterAndSetterReordered(): ?number;

  get propWithMismatchingGetterAndSetter(): number;
  set propWithMismatchingGetterAndSetter(x: string): void; // doesn't match getter (OK)

  propOverriddenWithGetter: number; // error: can't shadow proto with incompatible own
  get propOverriddenWithGetter(): string;

  propOverriddenWithSetter: number; // error: can't shadow proto with incompatible own
  set propOverriddenWithSetter(x: string): void;
};

export {Foo};
