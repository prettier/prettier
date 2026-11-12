declare module "ordinary";
console.log("ordinary");
declare function a();
console.log("ordinary");

declare module "array";
[call()];
declare function b();
[call()];

declare module "body" {};
{ console.log("live"); }
function c() {};
{ console.log("live"); }

{ declare function d(); }
{ console.log("live"); }

if (condition) function e();
else { console.log("alternate"); }
{ console.log("live"); }

do function f(); while (condition);
{ console.log("live"); }

namespace N { export function g(); }
{ console.log("live"); }

switch (value) {
  case 1: function h();
  default: { console.log("default"); }
}

declare module "end";
declare function end();
