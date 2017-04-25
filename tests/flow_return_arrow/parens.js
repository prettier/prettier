const f = (): (string => string) => {};
const f = (): (a | string => string) => {};
const f = (): (a & string => string) => {};
function f(): string => string {}
