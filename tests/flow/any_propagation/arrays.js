//@flow

declare var noop : <T>(arr: Array<Array<T>>) => void;
declare var arr : Array<Array<?string>>;
let new_arr = [];
arr.forEach(x => new_arr.push(x));
new_arr = new_arr.filter(Boolean);
noop<string>(new_arr);
