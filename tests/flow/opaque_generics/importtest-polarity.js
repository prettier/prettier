// @flow

import type {Covariant, Contravariant, Invariant, All} from './test-polarity';

function test1(x: Covariant<number>) : Covariant<number | string> {
    return x;
}

function test2(x: Covariant<number | string>) : Covariant<number> { // Error number | string ~> number
    return x;
}

function test3(x: Contravariant<number | string>) : Contravariant<number> {
    return x;
}

function test4(x: Contravariant<number>) : Contravariant<number | string> { // Error: number | string ~> number
    return x;
}

function test5(x: Invariant<number>) : Invariant<number> {
    return x;
}

function test6(x: Invariant<number>) : Invariant<number | string> { // Error: number ~> number | string
    return x;
}

function test7(x: Invariant<number | string>) : Invariant<number> { // Error: number | string != number
    return x;
}

function test8(x: All<number, number, number | string>) : All<number, number | string, string> {
    // Ok: number ~> number, number ~> number | string, number | string ~> string
    return x;
}

function test9(x: All<number, number | string, number | string>) : All<number | string, number, number | string | null> { // Errors: number != number | string (invariant), number | string ~> number (covariant), number | string ~> number | string | null (contravariant)
    return x;
}
