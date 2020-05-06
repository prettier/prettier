//@flow
type Obj = { attr: number | string }

function f(obj: Obj, b: boolean) {
  obj.attr = 42;
  if (b) {
    obj.attr = "hello";
  } else {
    obj.attr = "hello";
  }
}

function g(obj: Obj, b: boolean) {
  obj.attr = 42;
  if (b) {
    obj.attr = "hello";
  }
}


function h(obj: Obj, b: boolean) {
  obj.attr = 42;
  if (obj.attr) {
    obj.attr = "hello";
  }
}

function i(obj: Obj, b: boolean) {
  obj.attr = 42;
  if (b) {
    obj.attr = "hello";
  }
  (obj.attr: number);
}
