async function f() { (await f()).length }
async function g() {
  invariant(
    (await driver.navigator.getUrl()).substr(-7)
  );
}