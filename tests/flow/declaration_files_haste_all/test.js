/**
 * Tests that .js.flow files are considered Flow files when `all` is set.
 */

import {foo} from './bar';

(foo: empty); // error: should be string
