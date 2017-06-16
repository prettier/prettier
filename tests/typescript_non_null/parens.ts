(a ? b : c) ![tokenKey];
(a || b) ![tokenKey];

async function f() {
    return (await foo())!;
}

function* g() {
    return (yield * foo())!;
}
