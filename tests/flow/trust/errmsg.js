//@flow

var a: $Trusted<number> = (42: any)
var b: any = (42: $Private<number>)
var c: $Trusted<number> = (42: $Private<number>)
var d: $Trusted<number> = (42: number)
var e: number = (42: $Private<number>);
