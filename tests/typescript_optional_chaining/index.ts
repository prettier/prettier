const obj: { [key: string]: any } = {};
const a = 1, b = 2, c = 3;

const valueFoo = obj?.foo;
const returnBar = obj.bar?.(a,b,c);
const longChain = obj?.a?.b?.c?.d?.e?.f?.g;
const longChainCallExpression = obj.a?.(a,b,c).b?.(a,b,c).c?.(a,b,c).d?.(a,b,c).e?.(a,b,c).f?.(a,b,c)