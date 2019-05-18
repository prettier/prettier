(a ? b : c) ![tokenKey];
(a || b) ![tokenKey];
(void 0)!;

async function f() {
    return (await foo())!;
}

function* g() {
    return (yield * foo())!;
}

const a = (b()!)();
const b = c!();
const c = new (d()!)();
