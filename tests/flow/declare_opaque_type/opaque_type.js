opaque type FBID = string;

function concat(a: FBID, b: FBID) {
    return a + b;
}

function toFBID(x: string) {
    return x;
}

// This should work for now, but should stop working when opaque type is
// implemented.
function toString(x: FBID) {
    return x;
}
