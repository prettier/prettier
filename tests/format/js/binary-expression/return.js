async function* foo() {
  return this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right;
  yield this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right;
  throw this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right;
  await this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right;
}

async function* foo2() {
  return this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right
    ? true
    : false;
  yield this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right
    ? true
    : false;
  throw this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right
    ? true
    : false;
  await this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right
    ? true
    : false;
}

async function* foo3() {
  return this.calculate().compute().first.numberOfThings > this.calculate().compute().last.numberOfThings
    ? true
    : false;
  yield this.calculate().compute().first.numberOfThings > this.calculate().compute().last.numberOfThings
    ? true
    : false;
  throw this.calculate().compute().first.numberOfThings > this.calculate().compute().last.numberOfThings
    ? true
    : false;
  await this.calculate().compute().first.numberOfThings > this.calculate().compute().last.numberOfThings
    ? true
    : false;
}
