// @flow

import {foo} from './dependency';

// $FlowFixMe - Suppresses error in unrelated.js
foo(123);
