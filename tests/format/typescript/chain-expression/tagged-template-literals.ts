// Member expressions
(a?.b)!   ``;
(a?.b!)   ``;
(a!?.b)   ``;
(a.b?.c)!   ``;
(a.b?.c!)   ``;
(a.b!?.c)   ``;
(a!.b?.c)   ``;
(a?.b.c)!   ``;
(a?.b.c!)   ``;
(a?.b!.c)   ``;
(a!?.b.c)   ``;
(a[b?.c])!   ``;
(a[b?.c]!)   ``;
(a[b?.c!])   ``;
(a[b!?.c])   ``;
((a?.b).c)!   ``;
((a?.b).c!)   ``;
((a?.b!).c)   ``;
((a!?.b).c)   ``;
(a[b?.()])!   ``;
(a[b?.()]!)   ``;
(a[b?.()!])   ``;
(a[b!?.()])   ``;
(a![b?.()])   ``;
((a?.b).c)!   ``;
((a?.b).c!)   ``;
((a?.b)!.c)   ``;
((a?.b!).c)   ``;
((a!?.b).c)   ``;
((a?.()).b)!   ``;
((a?.()).b!)   ``;
((a?.())!.b)   ``;
((a?.()!).b)   ``;
((a!?.()).b)   ``;

// Call expressions
(a?.())!   ``;
(a?.()!)   ``;
(a!?.())   ``;
(a.b.c?.())!   ``;
(a.b.c?.()!)   ``;
(a.b.c!?.())   ``;
(a.b?.c())!   ``;
(a.b?.c()!)   ``;
(a.b!?.c())   ``;
(a?.b.c())!   ``;
(a?.b.c()!)   ``;
(a?.b!.c())   ``;
(a(b?.c))!   ``;
(a(b?.c)!)   ``;
(a(b?.c!))   ``;
((a?.b)())!   ``;
((a?.b)()!)   ``;
((a?.b)!())   ``;
((a?.b!)())   ``;
((a?.())())!   ``;
((a?.())()!)   ``;
((a?.())!())   ``;
((a?.()!)())   ``;
((a!?.())())   ``;

// In optional chaining
((a?.b!)?.c)``;
((a?.b)!?.c)``;

// `TSInstantiationExpression`
new (f?.g<h>)();
// These parentheses should be reserved
(a?.b()!)`foo`;
(a?.b<c>)`foo`;
// These parentheses can be stripped
(a.b()!)`foo`;
// https://github.com/typescript-eslint/typescript-eslint/issues/12863
// (a.b<c>)`foo`;
