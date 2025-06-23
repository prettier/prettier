type A = import("./long/long/long/long/long/long/long/long/long/long/path/to/module")
type B = import("./long/long/long/long/long/long/long/long/long/long/path/to/module",{with:{type:'json'}})
// https://github.com/microsoft/TypeScript/issues/61916
// type C = import("./long/long/long/long/long/long/long/long/long/long/path/to/module",{with:{
// type:'json'}})
// type D = import("./long/long/long/long/long/long/long/long/long/long/path/to/module",{
// with:{type:'json'}})
