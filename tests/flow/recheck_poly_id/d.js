// @flow

import type { T as B } from './b';
import type { T as C } from './c';
function foo(x: B<string>): C<number> { return x; }
