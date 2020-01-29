// @flow

const React = require('react');
type PropsType = { }

class Child extends React.Component<PropsType> {}
const HocChild: React.ComponentType<PropsType> = (null: any);

class OkParent extends React.Component<void> {
  render = () => <Child ref={this._handleChild} />;
  _handleChild = (child: ?Child) => {};
}

class BadParent extends React.Component<void> {
  render = () => <HocChild ref={this._handleChild} />;
  _handleChild = (child: ?HocChild) => {};
}
