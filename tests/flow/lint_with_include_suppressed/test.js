/* @flow */

//never enabled suppression; not added by --include-suppressed
var a: ?number = 0;
if (a){}

//flowlint sketchy-null:warn
var b: ?number = 0;
//flowlint-next-line sketchy-null:off
if (b){} //warning included by --include-suppressed (reported as an error)

//flowlint sketchy-null:error
var c: ?number = 0;
//flowlint-next-line sketchy-null:off
if (c){} //error included by --include-suppressed
