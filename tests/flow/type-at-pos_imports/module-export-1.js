// @flow

module.exports = 1;
(module.exports: number);

if (0 < 1) {
  module.exports = "blah";
  (module.exports: string);
}
(module.exports: number | string);
