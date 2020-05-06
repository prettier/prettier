// @flow

import type {Fn} from "./a";

declare var f: Fn;

f(x => {
  if (x) {}
});
