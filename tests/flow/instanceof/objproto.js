class C { p: string }
declare var c: C;
if (c instanceof Object) { // refinement succeeds
  (c.p: empty); // error: string ~> empty
}
