async function f() { (await f()).length }
async function g() {
  invariant(
    (await driver.navigator.getUrl()).substr(-7)
  );
}
function *f(){
  !(yield a);
}
async function f() {
  a = !await f();
}
async () => {
  new A(await x);
  obj[await x];
}
