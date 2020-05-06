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

ReactDOM.render(<Example/>, test$querySelector('#site'), () => {
	console.log('Rendered - arrow callback');
});

ReactDOM.render(<Example/>, test$querySelector('#site'), function() {
	console.log('Rendered - function callback');
});

// These should raise a warning
ReactDOM.render(<Example/>, test$querySelector('#site'), 1);
ReactDOM.render(<Example/>, test$querySelector('#site'), {});
ReactDOM.render(<Example/>, test$querySelector('#site'), '');
ReactDOM.render(<Example/>, test$querySelector('#site'), null);
