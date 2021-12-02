import * as React from "react";

import { stateToggler, shallowEqual } from "./helpers.js";
import * as storage from "./storage.js";

export default class EditorState extends React.Component {
  constructor() {
    super();
    this.state = {
      showSidebar: window.innerWidth > window.innerHeight,
      showAst: false,
      showDoc: false,
      showComments: false,
      showSecondFormat: false,
      showInput: true,
      showOutput: true,
      toggleSidebar: () => this.setState(stateToggler("showSidebar")),
      toggleAst: () => this.setState(stateToggler("showAst")),
      toggleDoc: () => this.setState(stateToggler("showDoc")),
      toggleComments: () => this.setState(stateToggler("showComments")),
      toggleSecondFormat: () => this.setState(stateToggler("showSecondFormat")),
      toggleInput: () => this.setState(stateToggler("showInput")),
      toggleOutput: () => this.setState(stateToggler("showOutput")),
      ...storage.get("editor_state"),
    };
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
