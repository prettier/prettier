//@flow
// This test makes resolve_type encounter a MergedT. Previously, this would
// cause a crash.
const Lib = require('lib');

class Component extends Lib.Super<{}> {
  arr(): Array<number> {
    return [];
  }
}
