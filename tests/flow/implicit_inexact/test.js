//@flow

type T = {}; // need ... in type alias

opaque type U = {}; // need ... in opaque type alias

function test1(x: {}) {} // need ... in function param

function test2(): {} { return {}; } // need ... in function return

function test3<T>() {}
test3<{}>(); // need ... in generic function type parameter

class A<T: {}> {} // need ... in upper bound of generic

class B<T> {}
new B<{}>(); // need ... in generic class type parameter

({}: {}); // need ... in cast

const x: {} = {}; // need ... in annotation

// No errors with ...
type V = {...};

opaque type W = {...};

function test4(x: {...}) {}

function test5(): {...} { return {}; }

function test6<T>() {}
test6<{...}>();

class C<T: {...}> {}

class D<T> {}
new D<{...}>(); // need ... in generic class type parameter

({}: {...});

const y: {...} = {};
