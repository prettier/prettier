/* @flow */

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ audio: true }); // correct
}

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ video: true }); // correct
}

navigator.mediaDevices.getUserMedia({ audio: true }); // incorrect

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user' // correct
    }
  });
}
