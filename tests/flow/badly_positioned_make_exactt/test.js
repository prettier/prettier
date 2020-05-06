// @flow
import * as React from 'react';

type RequiredProps<ItemT> = {
    x : any,
};
type RequiredProps1 = {
    y : any,
};

export type Props<ItemT> = RequiredProps<ItemT> & RequiredProps1;

class FlatList<ItemT> extends React.Component<Props<ItemT>> {}

type Props1<ItemT> = $Exact<Props<ItemT>>;
class X extends React.Component<Props1<mixed>> {}
<X />;
