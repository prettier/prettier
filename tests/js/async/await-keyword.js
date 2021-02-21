async function foo() {
  function bar(x = await 2) {}
}

async (x = await 2) => {};
