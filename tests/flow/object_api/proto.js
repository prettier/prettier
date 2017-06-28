var o1 = {};
var o1_proto = o1.__proto__; // ObjProtoT
(o1_proto.toString: empty); // error: function ~> empty

var o2 = Object.create({p:0});
var o2_proto = o2.__proto__; // {p:0}
(o2.__proto__.p: empty); // error: number ~> empty

class C1 {
  m() {}
}
var C1_proto = C1.__proto__; // TODO: should be Function.prototype
(C1_proto.bind: empty); // TODO error: function ~> empty

var inst1 = new C1;
var inst1_proto = inst1.__proto__; // TODO: should be C1.prototype
(inst1_proto.m: empty); // TODO error: function ~> empty
