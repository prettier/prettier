// @flow

import {foo} from './dependency';

foo("hello"); // No error

// $FlowFixMe - Unused suppression
