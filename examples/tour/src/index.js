'use strict';

const Prism = require('prismjs');
const Video = require('twilio-video');
const getSnippet = require('../../util/getsnippet');
const getRoomCredentials = require('../../util/getroomcredentials');
const helpers = require('./helpers');
const createScreenTrack = helpers.createScreenTrack;
const captureScreen = document.querySelector('button#capturescreen');
const screenPreview = document.querySelector('video#screenpreview');
// const stopScreenCapture = document.querySelector('button#stopscreencapture');
const remoteScreenPreview = document.querySelector('video.remote-screenpreview');
const jwt = require('jsonwebtoken');


(async function () {
  // // Load the code snippet.
  // const snippet = await getSnippet('./helpers.js');
  // const pre = document.querySelector('pre.language-javascript');
  // pre.innerHTML = Prism.highlight(snippet, Prism.languages.javascript);

  const logger = Video.Logger.getLogger('twilio-video');
  logger.setLevel('silent');

  // Connect Local Participant (screen-sharer) to a room
  const localCreds = await getRoomCredentials();
  let roomLocal = await Video.connect(localCreds.token, {
    tracks: []
  });

  // Connect Remote Participant (screen-viewer) to the room
  const remoteCreds = await getRoomCredentials();
  let roomRemote = await Video.connect(remoteCreds.token, {
    name: roomLocal.name,
    tracks: []
  });

  // Hide the "Stop Capture Screen" button.
  // stopScreenCapture.style.display = 'none';

  // The LocalVideoTrack for your screen.
  let screenTrack;

  captureScreen.onclick = async function () {
    try {
      // // Create and preview your local screen.
      // screenTrack = await createScreenTrack(720, 1280);
      // screenTrack.attach(screenPreview);

      // // Publish screen track to room
      // await roomLocal.localParticipant.publishTrack(screenTrack);

      // // When screen sharing is stopped, unpublish the screen track.
      // screenTrack.on('stopped', () => {
      //   if (roomLocal) {
      //     roomLocal.localParticipant.unpublishTrack(screenTrack);
      //   }
      //   // toggleButtons();
      // });

      await gToken(true);
      let response = await fetch(`/middleware?hash=${key}`, {
        method: 'GET',
        // mode: 'navigate',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${key}`,
        },
        redirect: 'follow'
        // referrerPolicy: 'no-referrer',
        // body: ''
      });
      if (response.redirected && response.url) {
        window.location.href = response.url;
        // await fetch('/meeting');
      }

      // Show the "Stop Capture Screen" button.
      // toggleButtons();
    } catch (e) {
      alert(e.message);
    }
  };

  // Stop capturing your screen.
  const stopScreenSharing = () => screenTrack.stop();

  // stopScreenCapture.onclick = stopScreenSharing;

  // Remote Participant handles screen share track
  if (roomRemote) {
    roomRemote.on('trackPublished', publication => {
      onTrackPublished('publish', publication, remoteScreenPreview);
    });

    roomRemote.on('trackUnpublished', publication => {
      onTrackPublished('unpublish', publication, remoteScreenPreview);
    });
  }

  // Disconnect from the Room on page unload.
  window.onbeforeunload = function () {
    if (roomLocal) {
      roomLocal.disconnect();
      roomLocal = null;
    }
    if (roomRemote) {
      roomRemote.disconnect();
      roomRemote = null;
    }
  };

  const gToken = async (isHost) => {
    try {
      return await new Promise((res, rej) => {
        let hostName = randomString(10);
        key = jwt.sign({ roomId: null, host: isHost ? hostName : '' }, '!n|)I^', { algorithm: 'HS256' }) || 'INVALIDTOKEN';
        res(key);
      });
    } catch (e) {
      console.log(e);
      res(null);
    }
  }
}());

function toggleButtons() {
  captureScreen.style.display = captureScreen.style.display === 'none' ? '' : 'none';
  // stopScreenCapture.style.display = stopScreenCapture.style.display === 'none' ? '' : 'none';
}

function randomString(digit) {
  let text = '',
    base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < digit; i++)
    text += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length));
  return text;
}

function onTrackPublished(publishType, publication, view) {
  if (publishType === 'publish') {
    if (publication.track) {
      publication.track.attach(view);
    }

    publication.on('subscribed', track => {
      track.attach(view);
    });
  } else if (publishType === 'unpublish') {
    if (publication.track) {
      publication.track.detach(view);
      view.srcObject = null;
    }

    publication.on('subscribed', track => {
      track.detach(view);
      view.srcObject = null;
    });
  }
}

let key;
