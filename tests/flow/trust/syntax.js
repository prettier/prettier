//@flow

declare function f(x: $Trusted<number>): $Private<number>;
declare var x: $Trusted<$Private<($Private<number>)=>$Trusted<number>>>;
declare var y: $Trusted<any>;
type T = $Trusted<number>;
declare var z: $Trusted<T>
(32: $Trusted<number>)
