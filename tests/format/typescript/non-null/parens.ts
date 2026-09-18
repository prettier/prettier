(a ? b : c) ![tokenKey];
(a || b) ![tokenKey];
(void 0)!;

async function f() {
    return (await foo())!;
}

function* g() {
    return (yield * foo())!;
}

const a = (b()!)(); // parens aren't necessary
const b = c!();

// parens are necessary if the expression result is called as a constructor
const c1 = new (d()!)();
const c2 = new (d()!);
const c3 = new (d()!.e)();
new (x()``.y!)();
new (x()``!.y)();
new (x()!``.y)();
new (x!()``.y)();

xyz.a(b!).a(b!).a(b!)

const x1 = (a /*
c1 */)!;
(obj.aaa /*
c2 */)!.substring(0);
(a.b /*
c3 */)!.c;
(obj.aaa /*
c4 */)!!.substring(0);
(wrapper.foo() /*
c5 */)!.bar();
(obj[key] /*
c6 */)!.substring(0);
((a as B) /*
c7 */)!.c();
((a, b) /*
c8 */)!.substring(0);
(a as B) /* c10 */!.c();
async function f2() {
  return (await foo() /*
c9 */)!;
}
(
  // prettier-ignore
  (a, b)
)!.foo;
