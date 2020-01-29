// @flow

var React = require('react');

type Props = { x: string };
class C extends React.Component<Props> {
}

let msg = "hello";

(<C x={msg}/>);

(<div id={msg}/>);
