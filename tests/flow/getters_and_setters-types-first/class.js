/**
 * @flow
 */

var z: number = 123;

class Foo {
  get goodGetterWithAnnotation(): number { return 4; }

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

export {Foo};
