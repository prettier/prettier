// @flow

//flowlint-next-line sketchy-null:error
var x: ?number = 0;

//flowlint-next-line sketchy-null:error
if (x) {} //Error

//flowlint-next-line sketchy-null:warn
if (x) {} //Warning
