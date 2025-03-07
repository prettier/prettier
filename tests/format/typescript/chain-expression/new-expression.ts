// Member expressions
// FIXME: new   (a?.b)!   ();
// FIXME: new   (a?.b!)   ();
new   (a!?.b)   ();
// FIXME: new   (a.b?.c)!   ();
// FIXME: new   (a.b?.c!)   ();
new   (a.b!?.c)   ();
new   (a!.b?.c)   ();
// FIXME: new   (a?.b.c)!   ();
// FIXME: new   (a?.b.c!)   ();
new   (a?.b!.c)   ();
new   (a!?.b.c)   ();
new   (a[b?.c])!   ();
new   (a[b?.c]!)   ();
new   (a[b?.c!])   ();
new   (a[b!?.c])   ();
new   ((a?.b).c)!   ();
new   ((a?.b).c!)   ();
new   ((a?.b!).c)   ();
new   ((a!?.b).c)   ();
new   (a[b?.()])!   ();
new   (a[b?.()]!)   ();
new   (a[b?.()!])   ();
new   (a[b!?.()])   ();
new   (a![b?.()])   ();
new   ((a?.b).c)!   ();
new   ((a?.b).c!)   ();
new   ((a?.b)!.c)   ();
new   ((a?.b!).c)   ();
new   ((a!?.b).c)   ();
// FIXME: new   ((a?.()).b)!   ();
// FIXME: new   ((a?.()).b!)   ();
// FIXME: new   ((a?.())!.b)   ();
// FIXME: new   ((a?.()!).b)   ();
// FIXME: new   ((a!?.()).b)   ();

// Call expressions
// FIXME: new   (a?.())!   ();
// FIXME: new   (a?.()!)   ();
new   (a!?.())   ();
// FIXME: new   (a.b.c?.())!   ();
// FIXME: new   (a.b.c?.()!)   ();
new   (a.b.c!?.())   ();
// FIXME: new   (a.b?.c())!   ();
// FIXME: new   (a.b?.c()!)   ();
new   (a.b!?.c())   ();
// FIXME: new   (a?.b.c())!   ();
// FIXME: new   (a?.b.c()!)   ();
new   (a?.b!.c())   ();
new   (a(b?.c))!   ();
new   (a(b?.c)!)   ();
new   (a(b?.c!))   ();
new   ((a?.b)())!   ();
new   ((a?.b)()!)   ();
new   ((a?.b)!())   ();
new   ((a?.b!)())   ();
new   ((a?.())())!   ();
new   ((a?.())()!)   ();
new   ((a?.())!())   ();
new   ((a?.()!)())   ();
new   ((a!?.())())   ();

// Not `.callee`
new Foo(a?.b!)
