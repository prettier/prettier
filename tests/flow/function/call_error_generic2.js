// @flow

declare function bar1<TKey: ?{+$data?: mixed}>(key: TKey): void;

function bar2(fragmentRef) {
  bar1(fragmentRef);
}

function foo(props: { userRef?: {} }) {
  const userRef = props.userRef;
  bar2(userRef);
}
