// @flow
export opaque type ID = number;

export function addition(x: ID, y: ID) : ID {
    return x + y;
}

export function expose(x: ID) : number {
    return x;
}

export function hide(x: number) : ID {
    return x;
}

export type num = number;
export opaque type onum = num;

export function mult(x: onum, y: num) : num {
    return x * y;
}

export function omult(x: onum, y: num) : onum {
    return x * y;
}

opaque type A = number;
opaque type B = number;

function convert(x: A) : B {
    return x;
}

export type TransparentMyNum = number;

exports.hide = hide;
