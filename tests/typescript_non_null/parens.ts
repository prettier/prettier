(a ? b : c) ![tokenKey];
(a || b) ![tokenKey];
(void 0)!;

async function f() {
    return (await foo())!;
}

function* g() {
    return (yield * foo())!;
}

const a = (b()!)(); // parens aren't necessary
const b = c!();

// parens are necessary if the expression result is called as a constructor
const c = new (d()!)();
const c = new (d()!);
const c = new (d()!.e)();
