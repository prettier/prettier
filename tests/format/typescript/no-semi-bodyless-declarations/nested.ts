{
  declare module "nested";
  { console.log("live"); }
}

namespace N {
  export function a();
  { console.log("live"); }
}

switch (value) {
  case 1:
    declare function b();
    { console.log("live"); }
    break;
  default:
    declare module "switch";
    { console.log("live"); }
}

class A {
  static {
    function c();
    { console.log("live"); }
  }
}
