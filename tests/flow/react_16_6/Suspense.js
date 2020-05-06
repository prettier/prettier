// @flow

import React from 'react';

const {Suspense} = React;

function Loading() {
  return <div>Loading...</div>;
}

{
  <Suspense fallback={Loading} /> // Error: function is incompatible with exact React.Element
}

{
  <Suspense fallback={<Loading/>} />
}

{
  <Suspense fallback={<Loading/>}>
    <div>Hello</div>
  </Suspense>
}

{
  <Suspense fallback={<Loading/>}>
    <Suspense />
  </Suspense>
}

{
  <Suspense fallback={<Loading/>}>
    <Suspense fallback={undefined} />
  </Suspense>
}

{
  <Suspense fallback={<Loading/>}>
    <Suspense fallback={null} />
  </Suspense>
}
