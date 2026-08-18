const generate = (
  // @ts-expect-error requireOutside Babel transform
  requireOutside('@babel/generator') as typeof import('@babel/generator')
).default;

const asExpression = (
  // comment
  a as T
).b;

const logicalExpression = (
  // comment
  a || b
).c;

const deepMemberChain = (
  // comment
  a as T
).b.c.d;

async function awaitExpression() {
  return (
    // comment
    await a
  ).b;
}
