// @flow

import A from './class';

const a = new A;
a._x = 1; // error when munge_underscores = true
a.y = ""; // okay
