// @flow

import type {Opaque, State} from './opaque_type.js'

type Obj = {[id: Opaque]: void};

declare var foo : null | Opaque;
declare var bar : null | Obj
if (foo != null && bar) {
  bar[foo];
}


function foo(state: State) {
  const id = state.o;
  if (id != null && state.d) {
    state.d.index[id];
  }
}
