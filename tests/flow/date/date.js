var d = new Date(0);
var x:string = d.getTime(); // expect error

var y:number = d; // expect error

// valid constructors
new Date();
new Date(1234567890);
new Date('2015/06/18');
new Date(2015, 6);
new Date(2015, 6, 18);
new Date(2015, 6, 18, 11);
new Date(2015, 6, 18, 11, 55);
new Date(2015, 6, 18, 11, 55, 42);
new Date(2015, 6, 18, 11, 55, 42, 999);

// invalid constructors
new Date({});
new Date(2015, '6');
new Date(2015, 6, '18');
new Date(2015, 6, 18, '11');
new Date(2015, 6, 18, 11, '55');
new Date(2015, 6, 18, 11, 55, '42');
new Date(2015, 6, 18, 11, 55, 42, '999');
new Date(2015, 6, 18, 11, 55, 42, 999, 'hahaha');
new Date('2015', 6);

var b:boolean = d > 0;
var n1:number = d - 12;
var n2:number = d & 255;
var n3:number = d + 12; // expect error
var s:string = d + 12; // fixme? in js this coerces both to string and concats them
