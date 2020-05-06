//Comments Redundant with Default (Error.)

//flowlint-line sketchy-null:off
//flowlint-next-line sketchy-null:off

//flowlint sketchy-null:off


//Comments Redundant with Earlier Range Comments (The first in a triple is valid; the others are errors.)

//flowlint sketchy-null:error
//flowlint sketchy-null:error
//flowlint-line sketchy-null:error

/*flowlint sketchy-null:off*/ //Unused suppression
//flowlint sketchy-null:off
//flowlint-line sketchy-null:off


//Comments with Duplicate Arguments (Error.)

//flowlint sketchy-null:error, sketchy-null:error
//flowlint-line sketchy-null:off, sketchy-null:off

//flowlint sketchy-null:off, sketchy-null:off
//flowlint-line sketchy-null:error, sketchy-null:error


//Comments with Self-Contradicting Arguments (Error.)

//flowlint sketchy-null:error, sketchy-null:off
//flowlint-line sketchy-null:error, sketchy-null:off


//Comments with Shadowing Arguments (Error.)

//flowlint sketchy-null-bool:error, sketchy-null:off
//flowlint-line sketchy-null-bool:error, sketchy-null:off


//Comments with Overlapping but Non-Shadowing Arguments (Not an error.)

/*flowlint sketchy-null:error, sketchy-null-bool:off*/ //Unused suppression
/*flowlint-line sketchy-null:error, sketchy-null-bool:off*/ //Unused suppression


//Comments Both Redundant with Themselves and Earlier Settings (Should only show one kind of error.)

/*Clearing the settings; not an error.*/ //flowlint sketchy-null:error
//flowlint sketchy-null:error, sketchy-null:error
//flowlint-line sketchy-null:error, sketchy-null:error

/*Clearing the settings; not an error.*/ /*flowlint sketchy-null:off*/ //Unused suppression
//flowlint sketchy-null:off, sketchy-null:off
//flowlint-line sketchy-null:off, sketchy-null:off


//Piecewise Shadowing (Error.)

//flowlint sketchy-null:error, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off, sketchy-null-mixed:off
//flowlint-line sketchy-null:error, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off, sketchy-null-mixed:off


//Piecewise Almost Shadowing (Not an error.)

/*flowlint sketchy-null:error, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off*/ //Unused suppressions
/*flowlint-line sketchy-null:error, sketchy-null-bool:off, sketchy-null-string:off, sketchy-null-number:off*/ //Unused suppressions
