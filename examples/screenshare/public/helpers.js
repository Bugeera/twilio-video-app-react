'use strict';

const Video = require('twilio-video');

/**
 * Create a LocalVideoTrack for your screen. You can then share it
 * with other Participants in the Room.
 * @param {number} height - Desired vertical resolution in pixels
 * @param {number} width - Desired horizontal resolution in pixels
 * @returns {Promise<LocalVideoTrack>}
 */
// function createScreenTrack(height, width) {
//   if (typeof navigator === 'undefined'
//     || !navigator.mediaDevices
//     || !navigator.mediaDevices.getDisplayMedia) {
//     return Promise.reject(new Error('getDisplayMedia is not supported'));
//   }
//   return navigator.mediaDevices.getDisplayMedia({
//     video: {
//       height: height,
//       width: width
//     }
//   }).then(function(stream) {
//     return new Video.LocalVideoTrack(stream.getVideoTracks()[0]);
//   }).catch(e => {
//     console.log(e);
//   });
// }

async function createScreenTrack(height, width) {
  if (typeof navigator === 'undefined'
    || !navigator.mediaDevices
    || !navigator.mediaDevices.getDisplayMedia) {
    return Promise.reject(new Error('getDisplayMedia is not supported'));
  }
  return new Promise((res, rej) => {
    navigator.mediaDevices.getDisplayMedia({
      video: {
        height: height,
        width: width
      }
    }).then(function (stream) {
      res(new Video.LocalVideoTrack(stream.getVideoTracks()[0]));
    }).catch(e => {
      console.log(e);
      res({});
    });

  });
}


exports.createScreenTrack = createScreenTrack;