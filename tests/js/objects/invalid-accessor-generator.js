// Invalid, but recoverable
// https://github.com/babel/babel/pull/11921/

({
    get *iterator() { },
    set *iterator(iter) { },
    get iterator2() { },
    set iterator2(iter) { },
});
