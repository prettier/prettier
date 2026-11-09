type T = [/* before */ number /* optional */ ? /* after */];
type U = [
// First member
string ?, // trailing
/* union */ (number | boolean) ?,
(() => /* return */ void) ?
];
