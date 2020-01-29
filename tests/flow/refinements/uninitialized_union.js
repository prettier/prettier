// @flow

declare var x: ?{f : string};

var y;

if (true) {
  y = x;
}

if (y != null && y.f != null) {

}
