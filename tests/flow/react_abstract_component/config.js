//@flow
const React = require('react');
type Props = {foo: number, bar: number};
type DefaultProps = {foo: number};
type Config = {+foo?: number, +bar: number};

declare var x: Config;
declare var y: React$Config<Props, DefaultProps>;
(x: React$Config<Props, DefaultProps>);
(y: Config);

type NotTheRightConfig = {+baz: number, +qux: number};
(y: NotTheRightConfig); // Error, configs don't match

declare var z: NotTheRightConfig;
(z: React$Config<Props, DefaultProps>); // Error, configs don't match

function HOC<Config, Instance>(
    x: React$AbstractComponent<Config, Instance>,
): React$AbstractComponent<Config, Instance> {
  return x;
}

function HOC2<Props: {}, DefaultProps: {}, Instance>(
    x: React$AbstractComponent<React$Config<Props, DefaultProps>, Instance>,
): React$AbstractComponent<React$Config<Props, DefaultProps>, Instance> {
  return x;
}

class Component extends React.Component<{foo: number, bar: number}> {
  static defaultProps = {foo: 3};
}

const WrappedComponent = HOC(Component);

// Make sure all props are correctly required
const _a = <WrappedComponent foo={3} bar={3} />;
const _b = <WrappedComponent bar={3} />;
const _c = <WrappedComponent foo={3} />; // Error missing bar

const WrappedComponent2 = HOC2(Component);
// KP: Props in HOC2 only receives upper bounds, so the config is never calculated
const _f = <WrappedComponent2 />;
