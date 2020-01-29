// @flow

import React from 'react';

{
  React.useReducer(); // Error: function requires another argument.
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return { count: action.payload };
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

const initialState = { count: 0 };

{
  const [state, dispatch] = React.useReducer(reducer, initialState);
  (state.count: number); // Ok
  (state.count: string); // Error: number is incompatible with string

  dispatch({ type: "reset", payload: 123 });
  dispatch({ type: "increment" });
  dispatch({ type: "decrement" });
}

{
  function init(initialArg){
    return {
      count: initialArg.initial
    }
  }

  const [state, dispatch] = React.useReducer(reducer, { initial: 123 }, init);
  (state.count: number); // Ok

  dispatch({ type: "reset", payload: 123 });
  dispatch({ type: "increment" });
  dispatch({ type: "decrement" });
}
