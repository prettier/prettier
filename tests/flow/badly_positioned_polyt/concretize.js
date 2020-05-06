// @flow

const React = require('React');

type Props = {
    onKeyDown?: ?(e: SyntheticKeyboardEvent<>) => mixed,
}
class C1 extends React.Component<Props> {};
function _onKeyDown(e: SyntheticKeyboardEvent<C1>): void {};
<C1 onKeyDown={_onKeyDown} />;
