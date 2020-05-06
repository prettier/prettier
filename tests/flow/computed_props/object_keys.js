//@flow


// Object.keys.map gives the arguments to map two lower bounds-- the keys of the object
// AND any, due to any propagation. Since we only error on multiple string literal object keys,
// we should expect an object with two keys to fail to construct an object from the computed keys
// but an object with only one key to pass.


const x = {foo: 3};
Object.keys(x).map(k => { return {[k]: k} }); // No error

const y = {foo: 3, bar: 3};
Object.keys(y).map(k => { return {[k]: k} }); // Error
