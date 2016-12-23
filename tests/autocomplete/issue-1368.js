/* @flow */
class Test {
  prop: number;

  constructor(prop: number) {
    this.prop = prop;
  }
}

class ExtendTest extends Test {
  extended: string;

  constructor(extended: string) {
    super(10);
    this.extended = extended;
  }

  method() {
    this.prop = 12;
    this./* here */
  }
}
