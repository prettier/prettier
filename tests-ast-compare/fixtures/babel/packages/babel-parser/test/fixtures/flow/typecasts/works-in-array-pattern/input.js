([a: string]) => {};
([a, [b: string]]) => {};
([a: string] = []) => {};
({ x: [a: string] }) => {};

async ([a: string]) => {};
async ([a, [b: string]]) => {};
async ([a: string] = []) => {};
async ({ x: [a: string] }) => {};

let [a1: string] = c;
let [a2, [b: string]] = c;
let [a3: string] = c;
let { x: [a4: string] } = c;
