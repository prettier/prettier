//@flow
var React = require("react");

export type Recipe<T> = (draft: T, state: $ReadOnly<T>) => void;
export type Mutate<T> = (recipe: Recipe<T>) => void;

type ConsumerRender<S> = (...S) => React$Node;

type ProviderProps<T> = {|
  children: React$Node,
  initialState?: T,
|};

export type Provider<T> = React$ComponentType<ProviderProps<T>>;

type GetReturnType = <T, S>((T) => S) => S;

type ConsumerProps<T, TSelect: $ReadOnlyArray<(T) => mixed>> = {|
  select?: TSelect,
  children?: ConsumerRender<$TupleMap<TSelect, GetReturnType>>,
  render?: ConsumerRender<$TupleMap<TSelect, GetReturnType>>,
|};

type Selector<T, R> = T => R;

export type Store<T> = {
  +Provider: Provider<T>,
  +Consumer: {
    <TSelect: $ReadOnlyArray<(T) => mixed>>(
      ConsumerProps<T, TSelect>,
    ): React$Node,
    // Need the following to fake this as a functional component
    displayName?: ?string,
    propTypes?: any,
    contextTypes?: any,
  },
  +mutate: Mutate<T>,
  createSelector<R>(Selector<T, R>): Selector<T, R>,
};

declare var store : Store<number>;
<store.Consumer></store.Consumer>
