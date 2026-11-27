function a() {
  // prettier-ignore
  foo
  // prettier-ignore
  foo;

  // prettier-ignore
  return foo
  // prettier-ignore
  return foo;

  // prettier-ignore
  throw foo
  // prettier-ignore
  throw foo;

  // prettier-ignore
  do{}while(0)
  // prettier-ignore
  do{}while(0);
}

function a11() {
  // prettier-ignore
  "use strict"
}
function a12() {
  // prettier-ignore
  "use strict";
}

// prettier-ignore
import "foo"
// prettier-ignore
import "foo";

let foo1, foo2
// prettier-ignore
export {foo1}
// prettier-ignore
export {foo2};
