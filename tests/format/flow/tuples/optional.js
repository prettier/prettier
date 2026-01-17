type A = [a?: string, +b?: number, -c?: boolean];

// Unaffected
type B = [?string, [?string], (?string) => boolean];
