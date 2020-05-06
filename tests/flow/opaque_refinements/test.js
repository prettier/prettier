declare opaque type T: mixed;
declare var o: { p: T };

// guard
if (o.p) {
  (o.p: T); // OK
}

// refine
if (o.p != null) {
  (o.p: T); // OK
}
