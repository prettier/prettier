// This is a minimal example of how to communicate via json-rpc with prettier.

var child_process = require('child_process');
var rpc = require('vscode-jsonrpc');

var child = child_process.spawn('bin/prettier.js', ['--json-rpc']);
 
var connection = rpc.createMessageConnection(
  new rpc.StreamMessageReader(child.stdout),
  new rpc.StreamMessageWriter(child.stdin)
);

connection.listen();

Promise.all([
  connection.sendRequest('format', 'x=>{x()}').then(({error, formatted}) => {
    console.log(formatted);
  }),
  connection.sendRequest('format', 'x(;)').then(({error, formatted}) => {
    console.log(error);
  })
]).then(() => {
  child.kill(); // Don't try this at home!
});
