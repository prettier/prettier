import "codemirror-graphql/mode";

import React from "react";
import ReactDOM from "react-dom";

import Playground from "./Playground";
import WorkerApi from "./WorkerApi";

ReactDOM.render(
  <Playground worker={new WorkerApi("/worker.js")} />,
  document.getElementById("root")
);
