function t(window) {
  delete (/** @type {any} */ window).__pwned;
}

!(/* foo */ x).y;
!(/* foo */ x)();
!(/* foo */ x)[0];
typeof (/* foo */ x).y.z();
void (/* foo */ x)?.y;
-(/* foo */ x)`tag`;
!(// foo
  x).y;

!(/* foo */ x || y);
!(x /* foo */).y;
