//@flow
import React from "react";

function F({x}: {x: number}): null { return null }

var x: ?number = 42;
if (x != null) {
  <F x={x /* should be ok */}>
    {x = null}
  </F>
}
if (x != null) {
  <F x={x /* should be ok */}>
    {(x: number)}
    <F x={x = null, 42}/>
    {(x: number) /* should fail */}
  </F>
}

if (x != null) {
  <F x={x = null, 42}>
    {(x: number) /* should fail */}
  </F>
}
