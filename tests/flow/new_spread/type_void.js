// @flow

declare class T {}
declare var x: T;

declare class U {}
declare var y: U;

type O1 = {...void};
declare var o1: O1;
(o1: {}); // ok
(o1: {||}); // error
(o1: {p:T}); // error
({}: O1); // ok
({p:x}: O1); // ok

type O2 = {|...void|};
declare var o2: O2;
(o2: {}); // ok
(o2: {||}); // ok
(o2: {p:T}); // error
({}: O2); // error
({p:x}: O2); // error

type O3 = {...null};
declare var o3: O3;
(o3: {}); // ok
(o3: {||}); // error
(o3: {p:T}); // error
({}: O3); // ok
({p:x}: O3); // ok

type O4 = {|...null|};
declare var o4: O4;
(o4: {}); // ok
(o4: {||}); // ok
(o4: {p:T}); // error
({}: O4); // error
({p:x}: O4); // error

type O5 = {...void, ...{p:T}};
declare var o5: O5;
(o5: {p?:T}); // ok
(o5: {p:T}); // error: o5.p is optional
({}: O5); // ok
({p:x}: O5); // ok
({p:y}: O5); // error: y ~> T
({p:x,q:y}: O5); // ok

type O6 = {...{p:T}, ...void};
declare var o6: O6;
(o6: {p?:T}); // error, void doesn't overwrite p
(o6: {p:T}); // ok
({}: O6); // ok
({p:x}: O6); // ok
({p:y}: O6); // error: y ~> T
({p:x,q:y}: O6); // ok
