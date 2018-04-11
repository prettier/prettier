import React from "react";

import { stateToggler, shallowEqual } from "./helpers";
import * as storage from "./storage";

export default class extends React.Component {
  constructor() {
    super();
    this.state = Object.assign(
      {
        showSidebar: false,
        showAst: false,
        showDoc: false,
        toggleSidebar: () => this.setState(stateToggler("showSidebar")),
        toggleAst: () => this.setState(stateToggler("showAst")),
        toggleDoc: () => this.setState(stateToggler("showDoc"))
      },
      storage.get("editor_state")
    );
  }

  componentDidUpdate(_, prevState) {
    if (!shallowEqual(this.state, prevState)) {
      storage.set("editor_state", this.state);
    }
  }

  render() {
    return this.props.children(this.state);
  }
}
