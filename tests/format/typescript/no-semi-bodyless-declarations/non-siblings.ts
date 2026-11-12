for(;;) function a();
{}

while (condition) function b();
{ console.log("live"); }

for (const item of items) function c();
{ console.log("live"); }

for (const key in object) function d();
{ console.log("live"); }

label: function e();
{ console.log("live"); }

if (condition) function f();
{ console.log("live"); }

if (condition) function g();
else function h();
{ console.log("live"); }

for (;;) if (condition) while (other) function i();
// The declaration is several levels below this block's sibling.
{ console.log("live"); }

with (object) function j();
{ console.log("live"); }
