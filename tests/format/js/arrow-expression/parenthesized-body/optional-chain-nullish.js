// Regression test for optional chaining with nullish coalescing in arrow bodies
// Issue TASK-045 ($25,000 USD Bounty)
const a = x => x?.(bar) ?? baz;
const b = user => user?.profile?.settings?.theme ?? "dark";
const c = (item, fallback) => item?.computePrice() ?? fallback;
const d = data => data?.items?.[0] ?? null;
const e = x => x?.foo?.() ?? "fallback";
