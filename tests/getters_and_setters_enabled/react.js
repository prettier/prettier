/**
 * @flow
 */

React.createClass({
  propTypes: {
    get a() { return 4; },
    set b(x: number) { this.c = x; },
    c: 10,
  }
});
