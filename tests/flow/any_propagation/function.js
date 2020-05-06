// @flow
declare var o: {[string]: string};
function f1(x) {
  // no errors, f1 is never called so `x` is never constrained
  o[x] = 42;
};

function f2(x) {
  // error, cast below constrains `x`, so we see the set-elem error
  o[x] = 42;
};
(f2: (string) => void);

function f3(x) {
  // error, case to any also constrains `x`, so we see the set-elem error
  o[x] = 42;
};
(f3: any);
