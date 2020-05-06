// The variable declaration has level error, but the reported level is the min
// of all levels in all locations touched by the error.

//flowlint-next-line sketchy-null:error
var x: ?number = 0;

if (x) {} //suppressed by default

//flowlint sketchy-null:warn
if (x) {} //appears as a warning

//flowlint sketchy-null:error
if (x) {} //appears as an error
