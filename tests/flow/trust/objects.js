//@flow
var w: $Trusted<number> = 42;
var x: {y: $Trusted<number>} = {y: w}
var z: any = x;
