import {hide} from './test2';
export opaque type ID = number;

export function show(x: ID) : number {
    return x;
}

export function opaquify(x: number) : ID {
    return x;
}

hide(3);
