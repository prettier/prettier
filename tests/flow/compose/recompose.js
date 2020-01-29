/**
 * @flow
 *
 * This test was taken from:
 * https://github.com/istarkov/flow-compose-error
 */

import { compose } from 'recompose';

// shared code between bad/good Compose
type Comp<A> = (a: A) => void;
type HOC<A, B> = (a: Comp<A>) => Comp<B>;

function myEnhancer<A, B>(mapper: B => A): HOC<A, B> {
  return (comp: Comp<A>) => (props: B) => comp(mapper(props));
}

const enhancer: HOC<*, { p: number, e: string }> = compose(
  myEnhancer(props => ({
    p: `${props.p * 3}`,
  })),
  myEnhancer(props => ({
    c: Math.round(props.p), // Error: string ~> number
  }))
);
