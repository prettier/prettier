/* @flow */
var a = [];
for (var i = 0; i < 10; ++i) {
    if (i % 2 == 0) { a[i] = 0; }
    else { a[i] = ''; };
}

// `i` never gets a lower bound, so the array access is stalled until the
// function is called.
function foo(i): string { return a[i]; }

// here, because we call `bar`, we the array access constraint is discharged and
// we realize a type error.
function bar(i): string { return a[i]; }
bar(0);

// annotations suffice to unblock the access constraint as well, so only
// uncalled internal functions will not find a type error, which is acceptable
// behavior as such functions are dead code.
function baz(i:number): string { return a[i]; }
