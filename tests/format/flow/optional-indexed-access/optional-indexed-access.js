type A = Obj?.['foo'];

type B = Obj?.['foo']['bar'];

type C = Obj['foo']?.['bar'];

type D = (Obj?.['foo'])['bar'];
