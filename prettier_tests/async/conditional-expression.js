async function f() {
  const result = typeof fn === 'function' ? await fn() : null;
}
