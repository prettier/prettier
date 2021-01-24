// #1013
const [ /* full match */, username, /* role */, /* title */, email ] = user;

// `Null` node is zero width, it should print "", if ignored
const [/* prettier-ignore */, a,] = [/* prettier-ignore */, b,];
// There is no room for `Null` node, so we store node at the position of token before
const [,,,c] = [,,,d]
