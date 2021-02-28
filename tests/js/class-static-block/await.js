var C;

C = class { static { function f() { await } } };

C = class { static { function f(await) {} } };

C = class { static { function f(x = await) {} } };

C = class { static { function f({ [await]: x }) {} } };
