async function a() {
  for await((let).a of foo);
}
async function b() {
  for await((let)[a] of foo);
}
