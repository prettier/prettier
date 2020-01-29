/* This test ensures that computed properties are considered before allowing
 * writes to happen on the created object.
 *
 * If the `A` require resolves first, we still want to wait for `K` to resolve
 * before trying to access the `A.FOO` property on `o` below. */

import type {K} from "./a";
const A = require("./a");
declare var k: K;
var o = {[k]: null};
(o[A.FOO]: empty); // error: null ~> empty
