async function a() {
  for await((let).a of foo);
  for await((let)[a] of foo);
  for await((let)()[a] of foo);
}
