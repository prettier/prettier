// @flow

import React from "react";
import ReactDOM from "react-dom";

function Clock(props) {
  return (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {props.date.toLocaleTimeString()}.</h2>
    </div>
  );
}

function tick() {
  const element = document.getElementById('root');
  if (element) {
    ReactDOM.render(
      <Clock date={new Date()} />,
      element
    );
  }
}

setInterval(tick, 1000);
