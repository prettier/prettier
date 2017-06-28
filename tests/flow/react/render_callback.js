/* @flow */

const React = require('react');
const ReactDOM = require('react-dom');
const Example = React.createClass({
  propTypes: {
  },
  render() {
  	return <div>Hello</div>;
  }
});

ReactDOM.render(<Example/>, document.querySelector('#site'), () => {
	console.log('Rendered - arrow callback');
});

ReactDOM.render(<Example/>, document.querySelector('#site'), function() {
	console.log('Rendered - function callback');
});

// These should raise a warning
ReactDOM.render(<Example/>, document.querySelector('#site'), 1);
ReactDOM.render(<Example/>, document.querySelector('#site'), {});
ReactDOM.render(<Example/>, document.querySelector('#site'), '');
ReactDOM.render(<Example/>, document.querySelector('#site'), null);
