import "codemirror-graphql/cm6-legacy/mode.esm.js";
import "./install-service-worker.js";

import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./util.js";
import VersionLink from "./VersionLink.jsx";
import WorkerApi from "./WorkerApi.js";

const {
  React,
  ReactDOM: { createRoot },
} = window;

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
      <>
        <VersionLink version={version} />
        <Playground
          worker={this.worker}
          availableOptions={availableOptions}
          version={version}
        />
      </>
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

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
