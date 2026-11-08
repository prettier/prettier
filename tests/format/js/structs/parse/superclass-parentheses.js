struct Logical extends (A || B) {}
struct Binary extends (A + B) {}
struct Conditional extends (test ? A : B) {}
struct Sequence extends (A, B) {}
struct Arrow extends (() => A) {}
struct Assignment extends (A = B) {}
struct Unary extends (!A) {}
struct Await extends (await A) {}
