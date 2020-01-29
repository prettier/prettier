//@flow

function f1<T: string>(x: T) { return {[x]: x} } // ok
function f2<T>(x: T) { return {[x]: x} } // error. mixed can't be used as a computed prop
