//@flow

// any ~> functionlike
class C { }
var C_any: any = C;
declare var cmp: $Compose;
var cmp_cany: any = cmp;
declare var proto_apply: Function$Prototype$Apply;
declare var proto_bind: Function$Prototype$Bind;
declare var proto_call: Function$Prototype$Call;
var proto_apply_any: any = proto_apply;
var proto_bind_any: any = proto_bind;
var proto_call_any: any = proto_call;
function f() { }
var f_any: any = f;

// functionlike ~> any
declare var a: any;
var C_from_any: Class<C> = a;
var cmp_from_any: $Compose = a;
var proto_apply_from_any: Function$Prototype$Apply = a;
var proto_bind_from_any: Function$Prototype$Bind = a;
var proto_call_from_any: Function$Prototype$Call = a;
var f_from_any: () => void = a;

// any ~> objectlike
var c_any: any = new C();
var obj_any: any = {};
var obj_proto_any: any = Object.prototype;
var fun_proto_any: any = f.prototype;

// objectlike ~> any
var c_from_any: C = a;
var c_from_obj: {| |} = a;
var obj_proto_from_any: typeof Object.prototype = a;
var fun_proto_from_any: typeof f.prototype = a;

// any ~> get/method
declare var receiver: any;
declare var array: Array<number>;
var test1: string = array[receiver.name]; // if result of receiver.getprop is any, this will fail, but no error if it's empty.
var test2: string = array[receiver.name()] // likewise
