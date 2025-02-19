import streamConsumers from "node:stream/consumers";

function getStdin() {
  return streamConsumers.text(process.stdin);
}

export default getStdin;
