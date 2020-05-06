// @flow
let x : any = 3; // error
let y : Function = () => {}; // error
module.exports = {any: x, function: y};
