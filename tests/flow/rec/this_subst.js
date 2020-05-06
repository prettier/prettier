// @flow

var container = class InstrumentedContainer extends container {
  foo() {
    return this.props;
  }
};
