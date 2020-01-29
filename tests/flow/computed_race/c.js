/* This test ensures that computed properties are considered before allowing
 * writes to happen on the created object.
 *
 * If the `K` type import resolves first, we still want to wait for `A` to
 * resolve before trying to access the `k` property on `o` below. */

import type {K} from "./a";
const A = require("./a");
var o = {[A.FOO]: null};
declare var k: K;
(o[k]: empty); // error: null ~> empty
