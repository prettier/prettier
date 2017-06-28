type BadArity = $ElementType<number, number, number>;

type Arr = Array<number>;
type Arr_Elem = $ElementType<Arr, number>;

(42: Arr_Elem); // OK: `Arr_Elem` is `number`
('hello world': Arr_Elem);

function foo(a: Arr): $ElementType<Arr, number> {
  if (false) return a[0];
  else return 0;
}

type Obj = { [key: string]: number };
type Obj_Elem = $ElementType<Obj, string>;

(42: Obj_Elem); // OK: `Obj_Elem` is `number`
('hello world': Obj_Elem);

function bar(o: Obj): $ElementType<Obj, string> {
  if (false) return o['buz'];
  else return 0;
}
