// @flow

import * as React from 'react';

React.createElement(React.Fragment, null);

< ></>; // success

<></>; // success

<>hi</>; // success

<><span>hi</span><div>bye</div></>; // success

< // a comment
/* another comment */
>hi</>; // success
