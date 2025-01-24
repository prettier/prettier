import * as React from "react";
import { shallowEqual, stateToggler } from "./helpers.js";
import * as storage from "./storage.js";

export default class EditorState extends React.Component {
  constructor() {
    super();
    this.state = {
      showSidebar: window.innerWidth > window.innerHeight,
      showAst: false,
      showPreprocessedAst: false,
      showDoc: false,
      showComments: false,
      showSecondFormat: false,
      showInput: true,
      showOutput: true,
      rethrowEmbedErrors: false,
      toggleSidebar: () => this.setState(stateToggler("showSidebar")),
      toggleAst: () => this.setState(stateToggler("showAst")),
      togglePreprocessedAst: () =>
        this.setState(stateToggler("showPreprocessedAst")),
      toggleDoc: () => this.setState(stateToggler("showDoc")),
      toggleComments: () => this.setState(stateToggler("showComments")),
      toggleSecondFormat: () => this.setState(stateToggler("showSecondFormat")),
      toggleInput: () => this.setState(stateToggler("showInput")),
      toggleOutput: () => this.setState(stateToggler("showOutput")),
      toggleEmbedErrors: () =>
        this.setState(stateToggler("rethrowEmbedErrors")),
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
