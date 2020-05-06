/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * @providesModule FeedUFI.react
 * @flow
 */

'use strict';

var UFILikeCount = require('UFILikeCount.react');
var React = require('react');
import type {Node} from 'react';

var FeedUFI = React.createClass({
  _renderLikeCount: function(
      feedback: any
  ) {
    var props = {
      className: "",
      key: "",
      feedback: {feedback},
      permalink: "",
    };
    var ignored = <UFILikeCount {...props} />;
    return (
      <UFILikeCount
        className=""
        key=""
        feedback={feedback}
        permalink=""
      />
    );
  },

  render: function(): Node {
    return (
      <div/>
    );
  }

});

module.exports = FeedUFI;
