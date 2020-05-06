// @flow
import * as Test from './test';
import type {ID} from './test';

opaque type ID2 = number;

(3 : ID); // Error: number ~> ID

function bad1(x: number) : ID { // Error: number ~> ID
    return x;
}

function bad2(x: ID) : ID {
    return Test.hide(x); // Error: ID ~> number
}

function bad3(x: ID) : ID2 {
    return x; // Error: ID ~> ID2
}

function bad4(x: ID2) : ID { // Error: ID2 ~> ID
    return x;
}
