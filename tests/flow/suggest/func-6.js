// @flow
function error(wrong: number) {
  return wrong;
}
function throws_arg() {
  return error("42");
}
