//@flow
const React = require('react');

type Props = {| foo: number |};
const FancyButton = React.forwardRef<Props, _>((props, ref) => (
  <button ref={ref} className="FancyButton">
  </button>
));

(FancyButton: React.AbstractComponent<Props, HTMLButtonElement>);

const _a = <FancyButton />; // Error, missing foo
const _b = <FancyButton foo={3} />;
const _c = <FancyButton foo={3} bar={3} />; // Error bar, not allowed in exact props

const goodRef = React.createRef<HTMLButtonElement>();
const _d = <FancyButton foo={3} ref={goodRef} />;

const badRef = React.createRef<HTMLDivElement>();
const _e = <FancyButton foo={3} ref={badRef} />; // Incorrect ref type

const _f =  <FancyButton foo={3} ref={x => x} />;
const _g =  <FancyButton foo={3} ref={(x: null | HTMLDivElement) => x} />; // Incorrect ref type

type FooProps = {|foo: number|};

const UnionRef = React.forwardRef<FooProps, HTMLButtonElement | HTMLAnchorElement>(
  (props, ref): React.Element<'button' | 'a'> => {
    if (props.foo === 0) {
      return <a {...props} ref={ref} />;
    }

    return <button {...props} ref={ref} />;
  },
);

const unionRef = React.createRef<HTMLButtonElement | HTMLAnchorElement>();
const _h = <UnionRef foo={0} ref={unionRef} />;
const _i = <UnionRef foo={1} ref={unionRef} />;

const badUnionRef = React.createRef<HTMLButtonElement | HTMLDivElement>();
const _j = <UnionRef foo={3} ref={badUnionRef} />; // Error bad ref
