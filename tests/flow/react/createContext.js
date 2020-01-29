// @flow

import React from 'react';

{
  const Context = React.createContext('div');
  const {Consumer, Provider} = Context;

  class Foo extends React.Component<{}> {
    divRef: {current: null | HTMLDivElement} = React.createRef();

    render() {
      return (
        <React.Fragment>
          <Provider value='span'>
            <div ref={this.divRef}>
              <Consumer>
                {(Tag: 'div' | 'span' | 'img') => <Tag />}
              </Consumer>
            </div>
          </Provider>
          <Provider value='spam'> {/* Error: enum is incompatible with string */}
            <Consumer>
              {(Tag: 'div' | 'span' | 'img') => <Tag />}
            </Consumer>
          </Provider>
        </React.Fragment>
      );
    }

    componentDidMount() {
      var div: null | HTMLDivElement = this.divRef.current; // Ok
      var image: null | HTMLImageElement = this.divRef.current; // Error: HTMLDivElement is incompatible with HTMLImageElement
    }
  }
}

{
  const Context = React.createContext(
    {foo: 0, bar: 0, baz: 0},
    (a, b) => {
      let result = 0;
      if (a.foo !== b.foo) {
        result |= 0b001;
      }
      if (a.bar !== b.bar) {
        result |= 0b010;
      }
      return result;
    },
  );
}

{
  const ThemeContext = createContext("light");
  ThemeContext.displayName = "ThemeContext";
}
