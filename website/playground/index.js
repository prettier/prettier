import "codemirror-graphql/mode";

import React from "react";
import ReactDOM from "react-dom";

import Playground from "./Playground";
import VersionLink from "./VersionLink";
import WorkerApi from "./WorkerApi";
import { getAvailableOptions, fixPrettierVersion } from "./util";

const ENABLED_OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  { name: "semi", inverted: true },
  "singleQuote",
  { name: "bracketSpacing", inverted: true },
  "jsxBracketSameLine",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "insertPragma",
  "requirePragma"
].map(option => (typeof option === "string" ? { name: option } : option));

class App extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false };
    this.worker = new WorkerApi("/worker.js");
  }

  componentDidMount() {
    this.worker.getMetadata().then(({ supportInfo, version }) => {
      this.setState({
        loaded: true,
        availableOptions: getAvailableOptions(supportInfo, ENABLED_OPTIONS),
        version: fixPrettierVersion(version)
      });
    });
  }

  render() {
    const { loaded, availableOptions, version } = this.state;

    if (!loaded) {
      return "Loading...";
    }

    return (
      <React.Fragment>
        <VersionLink version={version} />
        <Playground
          worker={this.worker}
          availableOptions={availableOptions}
          version={version}
        />
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
