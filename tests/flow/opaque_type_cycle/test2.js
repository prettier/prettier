import {type ID, show, opaquify} from './test1';

export function hide(x: number) : ID {
    return x; // Error: number ~> ID
}

function bad(x: ID) : ID {
    return show(x); // Error: number ~> ID
}

function bad2(x: number): number {
    return opaquify(x); // Error: ID ~> number
}
