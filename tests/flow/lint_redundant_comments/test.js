//Comments Redundant with Default (Error.)

//flowlint-line sketchy-null:off
//flowlint-next-line sketchy-null:off

//flowlint sketchy-null:off


//Comments Redundant with Earlier Range Comments (The first in a triple is valid; the others are errors.)

//flowlint sketchy-null:on
//flowlint sketchy-null:on
//flowlint-line sketchy-null:on

//flowlint sketchy-null:off
//flowlint sketchy-null:off
//flowlint-line sketchy-null:off


//Comments with Duplicate Arguments (Error.)

//flowlint sketchy-null:on, sketchy-null:on
//flowlint-line sketchy-null:off, sketchy-null:off

//flowlint sketchy-null:off, sketchy-null:off
//flowlint-line sketchy-null:on, sketchy-null:on


//Comments with Self-Contradicting Arguments (Error.)

//flowlint sketchy-null:on, sketchy-null:off
//flowlint-line sketchy-null:on, sketchy-null:off


//Comments with Shadowing Arguments (Error.)

//flowlint sketchy-null-bool:on, sketchy-null:off
//flowlint-line sketchy-null-bool:on, sketchy-null:off


//Comments with Overlapping but Non-Shadowing Arguments (Not an error.)

//flowlint sketchy-null:on, sketchy-null-bool:off
//flowlint-line sketchy-null:on, sketchy-null-bool:off


//Comments Both Redundant with Themselves and Earleir Settings (Should only show one kind of error.)

/*Clearing the settings; not an error.*/ //flowlint-enable sketchy-null
//flowlint sketchy-null:on, sketchy-null:on
//flowlint-line sketchy-null:on, sketchy-null:on

/*Clearing the settings; not an error.*/ //flowlint-disable sketchy-null
//flowlint sketchy-null:off, sketchy-null:off
//flowlint-line sketchy-null:off, sketchy-null:off


//Piecewise Shadowing (Error.)

//flowlint sketchy-null:on, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off, sketchy-null-mixed:off
//flowlint-line sketchy-null:on, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off, sketchy-null-mixed:off


//Piecewise Almost Shadowing (Not an error.)

//flowlint sketchy-null:on, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off
//flowlint-line sketchy-null:on, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off
