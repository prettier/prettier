function* f() {
  (yield async (a) => a);
}

async function f3() {
  a = (await 1) ? 1 : 1;
}

(function () { }).length
typeof (function () { });
export default (function () { })();
(function () { })()``;
(function () { })``;
new (function () { });
(function () { });
a = function f() { } || b;
(function () { } && a);
a + function () { };
new function () { };
