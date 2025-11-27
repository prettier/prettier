import { createMethodShim } from "./shared.js";

const LeadSurrogateMin = 0xd800;
const LeadSurrogateMax = 0xdbff;
const TrailSurrogateMin = 0xdc00;

const stringIsWellFormed =
  String.prototype.isWellFormed ??
  /*
  This implementation is not verified, should only apply to meriyah package
  https://github.com/meriyah/meriyah/pull/527
  */
  function () {
    const len = this.length;
    for (let i = 0; i < len; i++) {
      const code = this.charCodeAt(i);
      // Single UTF-16 unit
      if ((code & 0xfc00) !== LeadSurrogateMin) {
        continue;
      }
      // unpaired surrogate
      if (
        code > LeadSurrogateMax ||
        ++i >= len ||
        (this.charCodeAt(i) & 0xfc00) !== TrailSurrogateMin
      ) {
        return false;
      }
    }

    return true;
  };

const isWellFormed = createMethodShim("isWellFormed", function () {
  if (typeof this === "string") {
    return stringIsWellFormed;
  }
});

export default isWellFormed;
