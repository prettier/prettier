declare class A {
  [number]: boolean;
  static [string]: boolean;
}

// Read-only
declare class B {
  +[number]: boolean;
  static +[string]: boolean;
}
