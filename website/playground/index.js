import "codemirror-graphql/mode";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Playground from "./Playground.js";
import { fixPrettierVersion } from "./util.js";
import VersionLink from "./VersionLink.js";
import WorkerApi from "./WorkerApi.js";

class App extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false };
    this.worker = new WorkerApi();
  }

  async componentDidMount() {
    const { supportInfo, version } = await this.worker.getMetadata();

    // eslint-disable-next-line @eslint-react/no-set-state-in-component-did-mount
    this.setState({
      loaded: true,
      availableOptions: supportInfo.options.map(augmentOption),
      version: fixPrettierVersion(version),
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

function augmentOption(option) {
  if (option.type === "boolean" && option.default === true) {
    option.inverted = true;
  }

  option.cliName =
    "--" +
    (option.inverted ? "no-" : "") +
    option.name.replaceAll(/(?<=[a-z])(?=[A-Z])/gu, "-").toLowerCase();

  return option;
}

ReactDOM.render(<App />, document.getElementById("root"));
