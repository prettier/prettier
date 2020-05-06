//@flow

var a = {x: 42};
a.x = ("Hello world": any);

var b: {x: number} = {x: 42};
b.x = ("Hello world": any);

var c: {x: $Trusted<number>} = {x: 42};
c.x = ("Hello world": any); // Error

var d = {x: 42};
d.x = ("Hello world": any);
var e:$Trusted<number> = d.x;
var k: {x: $Trusted<number>} = d;

var h = 42;
var f: {x: typeof h} = {x: 42};
f.x = ("Hello world": any);
var g:$Trusted<number> = f.x;

var i: 42 = 42
var j: $Trusted<42> = i;

var a1 = {x: 42};
var a2: {x: $Trusted<number>} = a1;
var a3: {x: number} = a1;
a3.x = ("Hello world": any);
