/* @flow */

type Shape =
  {type: 'rectangle', width: number, height: number} |
  {type: 'circle', radius: number};

function area(shape: Shape): number {
  if (shape.type === 'square') { // error
    return shape.width * shape.height;
  } else if (shape.type === 'circle') { // ok
    return Math.PI * Math.pow(shape.radius, 2);
  }
  throw "unreachable"; // TODO: this shouldn't be needed
}

type ExactShape =
  {|type: 'rectangle', width: number, height: number|} |
  {|type: 'circle', radius: number|};

function area2(shape: ExactShape): number {
  if (shape.type === 'square') { // error
    return shape.width * shape.height;
  } else if (shape.type === 'circle') { // ok
    return Math.PI * Math.pow(shape.radius, 2);
  }
  throw "unreachable"; // TODO: this shouldn't be needed
}

type ReadOnlyShape =
  {+type: 'rectangle', width: number, height: number} |
  {+type: 'circle', radius: number};

function area3(shape: ReadOnlyShape): number {
  if (shape.type === 'square') { // error
    return shape.width * shape.height;
  } else if (shape.type === 'circle') { // ok
    return Math.PI * Math.pow(shape.radius, 2);
  }
  throw "unreachable"; // TODO: this shouldn't be needed
}
