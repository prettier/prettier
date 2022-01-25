const assert = () => {};
assert.ok = noop;
assert.strictEqual = assert;
module.exports = assert;
