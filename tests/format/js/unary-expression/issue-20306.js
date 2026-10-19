function t(window) {
  delete (/** @type {any} */ window).__pwned;
}

delete (/* comment */ a.b).c;
typeof (/* comment */ a)?.b;
void (/* comment */ a)();
!(/* comment */ a || b).c;
typeof (/* comment */ class {}).name;
typeof (/* comment */ {}).a;
!(/* comment */ a)`x`;
typeof (// comment
  a).b;
