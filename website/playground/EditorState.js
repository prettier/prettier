import React from "react";

import { stateToggler, shallowEqual } from "./helpers";
import * as storage from "./storage";

export default class extends React.Component {
  constructor() {
    super();
    this.state = Object.assign(
      {
        sidebarExpanded: false,
        astPanelVisible: false,
        docPanelVisible: false,
        toggleAstPanelVisible: () =>
          this.setState(stateToggler("astPanelVisible")),
        toggleDocPanelVisible: () =>
          this.setState(stateToggler("docPanelVisible")),
        toggleSidebarExpanded: () =>
          this.setState(stateToggler("sidebarExpanded"))
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
