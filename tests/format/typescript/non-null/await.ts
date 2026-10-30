async (a) => (await a!) ** 6;

async function f() { return (await foo())!; }

function* g() { return (yield foo())!; }
