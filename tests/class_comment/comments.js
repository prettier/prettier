class A // comment 1
  // comment 2
  extends B {}

class A extends B // comment1
// comment2
// comment3
{}

class A /* a */ extends B {}
class A extends B /* a */ {}
class A extends /* a */ B {}

(class A // comment 1
  // comment 2
  extends B {});

(class A extends B // comment1
// comment2
// comment3
{});

(class A /* a */ extends B {});
(class A extends B /* a */ {});
(class A extends /* a */ B {});

class x {
  focus() // do nothing
  {
    // do nothing
  }
}
