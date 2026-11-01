delete (/* foo */ x).y;
!(/* foo */ x).y;
typeof (/* foo */ x).y;
void (/* foo */ x).y;
-(/* foo */ x).y;
delete (/* foo */ x)[y];
!(/* foo */ x)();
!(/* foo */ x).y.z;

function t(window) {
  delete (/** @type {any} */ window).__pwned;
}
