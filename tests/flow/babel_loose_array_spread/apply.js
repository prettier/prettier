f.apply(null, [1,2,3]); // No error

const it: Iterable<number> = [7,8,9];
if (Array.isArray(it)) {
  f.apply(null, it); // No error
}

// NOTE: This is ALWAYS incorrect since Function.prototype.apply only accepts
// arrays and array-like objects - never iterables. When that is fixed we can
// update this test to expect the proper error instead of the lint.
f.apply(null, it); // Error

function f(...args) {}
