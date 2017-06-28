// @flow

class NoProps {}

class NoReadProps {
  set a(value: number) {}
}

class OneProp {
  a: number;

  method() {}
}

class SomeProps {
  a: number;
  b: string;
  c: string;

  method() {}
}

class Parent { a: string; }
class Child extends Parent { b: number; }

('yo': $Values<NoProps>); // Error: There are no properties.
(123: $Values<NoProps>); // Error: There are no properties.
((() => {}): $Values<NoProps>); // Error: There are no properties.
(true: $Values<NoProps>); // Error: There are no properties.

('yo': $Values<NoReadProps>); // Error: There are no readable properties.
(123: $Values<NoReadProps>); // Error: There are no readable properties.
((() => {}): $Values<NoReadProps>); // Error: There are no readable properties.
(true: $Values<NoReadProps>); // Error: There are no readable properties.

('yo': $Values<OneProp>); // Error: There is no property with the type of
                          // string.
(123: $Values<OneProp>); // OK: There is a property with the type of number.
((() => {}): $Values<OneProp>); // Error: Even though there is a method, methods
                                // are on the prototype.
(true: $Values<OneProp>); // Error: There is no property with the type of
                          // boolean.

('yo': $Values<SomeProps>); // OK: There is a property with the type of string.
(123: $Values<SomeProps>); // Ok: There is a property with the type of number.
((() => {}): $Values<SomeProps>); // Error: Even though there is a method,
                                  // methods are on the prototype.
(true: $Values<SomeProps>); // Error: There is no property with the type of
                            // boolean.

('yo': $Values<Child>); // TODO: This should be ok since there is a property
                        // with the type of string on the parent.
(123: $Values<Child>); // OK: There is a property with the type of number.
((() => {}): $Values<Child>); // Error: There is no property with the type of
                              // function.
(true: $Values<Child>); // Error: There is no property with the type of boolean.
