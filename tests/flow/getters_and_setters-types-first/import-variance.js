/* @flow */

import {A, B, C, Base} from './variance';

declare var a: A;
declare var b: B;
declare var c: C;

(class extends Base {
  // error: getter incompatible with read/write property
  get x(): B { return b }
});

(class extends Base {
  // error: setter incompatible with read/write property
  set x(value: B): void {}
});

(class extends Base {
  // ok: get/set co/contra with read/write property, resp.
  get x(): C { return c }
  set x(value: A): void {}
});

(class extends Base {
  // error: setter incompatible with read-only property
  set pos(value: B): void {}
});

(class extends Base {
  // ok: getter covariant with read-only property
  get pos(): C { return c }
});

(class extends Base {
  // error: getter incompatible with write-only property
  get neg(): B { return b }
});

(class extends Base {
  // ok: setter contravariant with write-only property
  set neg(value: A): void {}
});

(class extends Base {
  // ok: read/write covariant with getter
  get: C;
});

(class extends Base {
  // ok: read/write contravariant with setter
  set: A;
});

(class extends Base {
  // ok: read/write invariant with get/set
  getset: B;
});
