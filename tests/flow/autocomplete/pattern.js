//@flow

var foo = 1;
//     ^ we shouldn't suggest to shadow an existing variable

foo = 2;
// ^ it makes sense to suggest existing variables in assignments

function bar() {}
//           ^ we shouldn't suggest that the param shadow an existing variable
