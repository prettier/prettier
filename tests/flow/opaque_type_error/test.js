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

opaque type MyNum = number;
("hello": MyNum) // Error: string ~> number
