/* c8 ignore start */
import streamConsumers from "node:stream/consumers";

function getStdin() {
  return streamConsumers.text(process.stdin);
}

export default getStdin;
/* c8 ignore end */
