// https://github.com/babel/babel/pull/11640

100m;
9223372036854775807m;
0.m;
3.1415926535897932m;
100.000m;
.1m;
({ 0m: 0, .1m() {}, get 0.2m(){}, set 3m(_){}, async 4m() {}, *.5m() {} });
1.m;
100m;
9223372036854775807m;
100.m;

// Invalid decimal
2e9m;
016432m;
089m;

// https://github.com/tc39/proposal-decimal
.1m + .2m === .3m;
2.00m;
-0m;
typeof 1m === "bigdecimal";
typeof 1m === "decimal128";

