// @flow

function foo(r: $Keys<typeof R>): boolean {
  switch (r) {
    case R.A:
      return false;
    case R.B:
      return false;
    default:
      return true;
  }
}

const R: {|
  A: 'A',
  B: 'B',
|} = {
  A: 'A',
  B: 'B',
};
