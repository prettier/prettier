function outer() {
  if (ready) {
    foo; // first
    // second
    ;// third

    function x() {}
  }
  finish();
}
