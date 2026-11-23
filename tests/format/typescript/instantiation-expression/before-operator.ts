x = (make<T>) + y;
x = (make<T>) - y;
x = (make<T>) < y;
x = (make<T>) > y;
x = (make<T>) >= y;
x = (make<T>) >> y;
x = (make<T>) >>> y;
x = (a + make<T>) - y;
x = (make<T>) * y;
x = (make<T>) <= y;
x = (make<T>) === y;
x = y + make<T>;
x = (make<T>) in (make<T>)
x = (make<T>) instanceof (make<T>)
x = (typeof make<T>) + y;
x = (void make<T>) - y;
x = (delete make<T>) < y;
x = (!make<T>) > y;
x = (-make<T>) >> y;
x = (+make<T>) - y;
x = (~make<T>) + y;
x = (<any>make<T>) + y;
x = (a + typeof make<T>) - y;
x = (typeof typeof make<T>) + y;
x = (typeof make<T>) in (typeof make<T>)
x = (typeof make<T>) in (make<T>)
async function* f() {
  x = (<any>await make<T>) < y;
  x = (typeof await make<T>) + y;
  x = (typeof (yield make<T>)) + y;
  x = (<any>(yield make<T>)) - y;
  x = (<any>(yield)) - y;
}
