const member = async () => ((
  // leading
  await foo()) as T).value;
const optionalMember = async () => ((
  // leading
  await foo()) satisfies T)?.value;
const call = async () => ((
  // leading
  await foo()) as T)();
const optionalCall = async () => ((
  // leading
  await foo()) satisfies T)?.();
const construct = async () => new ((
  // leading
  await foo()) as T)();
const block = async () => ((
  /* leading */
  await foo()) as T).value;
const mixed = async () => ((
  // leading
  await foo()) as T /* trailing */).value;
const line = async () => ((
  // leading
  await foo()) as T // trailing
).value;
