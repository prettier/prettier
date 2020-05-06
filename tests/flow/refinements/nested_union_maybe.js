// @flow

declare function foo(x : number) : ?string;

declare var x : number;
const y = true
    ? foo
        ? foo(x)
        : null
    : 'fail';


if(y != null) { (y : string) }


