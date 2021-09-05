'use strict';

const Prism = require('prismjs');
const Video = require('twilio-video');
const getSnippet = require('../../util/getsnippet');
const getRoomCredentials = require('../../util/getroomcredentials');
const helpers = require('./helpers');
const createScreenTrack = helpers.createScreenTrack;
const captureScreen = document.querySelector('button#capturescreen');
const screenPreview = document.querySelector('video#screenpreview');
const stopScreenCapture = document.querySelector('button#stopscreencapture');
const remoteScreenPreview = document.querySelector('video.remote-screenpreview');
const selectRoom = require('../../../quickstart/src/selectroom');
const showError = require('../../../quickstart/src/showerror');

const $showErrorModal = $('#show-error', $modals);
const $joinRoomModal = $('#join-room', $modals);
const jwt = require('jsonwebtoken');

(async function () {
  debugger;
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
  stopScreenCapture.style.display = 'none';

  // The LocalVideoTrack for your screen.
  let screenTrack;

  async function captureStart() {
    try {
      // Create and preview your local screen.
      screenTrack = await createScreenTrack(720, 1280);
      screenTrack.attach(screenPreview);

      // Publish screen track to room
      await roomLocal.localParticipant.publishTrack(screenTrack);

      // When screen sharing is stopped, unpublish the screen track.
      screenTrack.on('stopped', () => {
        if (roomLocal) {
          roomLocal.localParticipant.unpublishTrack(screenTrack);
        }
        toggleButtons();
      });

      // Show the "Stop Capture Screen" button.
      toggleButtons();
    } catch (e) {
      alert(e.message);
    }
  };

  captureScreen.onclick = captureStart;

  // Stop capturing your screen.
  const stopScreenSharing = () => screenTrack.stop();

  stopScreenCapture.onclick = stopScreenSharing;

  // Remote Participant handles screen share track
  if(roomRemote) {
    roomRemote.on('trackPublished', publication => {
      onTrackPublished('publish', publication, remoteScreenPreview);
    });

    roomRemote.on('trackUnpublished', publication => {
      onTrackPublished('unpublish', publication, remoteScreenPreview);
    });
  }

  // Disconnect from the Room on page unload.
  window.onbeforeunload = function() {
    if (roomLocal) {
      roomLocal.disconnect();
      roomLocal = null;
    }
    if (roomRemote) {
      roomRemote.disconnect();
      roomRemote = null;
    }
  };
}());

function toggleButtons() {
  captureScreen.style.display = captureScreen.style.display === 'none' ? '' : 'none';
  stopScreenCapture.style.display = stopScreenCapture.style.display === 'none' ? '' : 'none';
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





const hash = getQueryVariable('hash');
const vals = hash.split('.'), hostParam = vals.pop();
const isHost = hostParam.length == 10 && !vals[0];
let payload, newRoomId;
if (isHost) {
  newRoomId = randomString(16);
  captureScreen.style.display = 'none';
  captureScreen.click();
  // await captureStart();
  // processView(true, newRoomId);
} else {
  const formData = (async ()=>  await selectRoom($joinRoomModal, error))();
  if (!formData) {
    // User wants to change the camera and microphone.
    // So, show them the microphone selection modal.
    deviceIds.audio = null;
    deviceIds.video = null;
    return selectMicrophone();
  }
  const { identity, roomName } = formData;


  if (vals[0]) {
    let tkn = vals.join('.');
    payload = jwt.verify(tkn, '!n|)I^', { algorithm: 'HS256' });
    processView(false, payload.roomId);
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function processView(isHost, roomId = randomString(16)) {
  let roomInp = document.getElementById('room-name');
  let userInp = document.getElementById('screen-name');
  let userDiv = document.getElementById('uname');
  if (isHost) {
    userInp.value = hostParam;
    userDiv.style.display = 'none';
  } else {
    userInp.value = '';
  }
  roomInp.value = roomId;
  roomInp.setAttribute('readonly', 'readonly');
  $(document).ready((p) => {
    if (isHost) $('button.btn-primary.pass').click();
    else {
      document.getElementById('invite-link').style.display = 'none';
    }
  });
};

$('#invite-link').on('click', () => {
  let token = jwt.sign({ roomId: newRoomId, host: hostParam }, '!n|)I^', { algorithm: 'HS256' })
    || 'INVALIDTOKEN';
  token = `${token}.${hostParam}`;
  let link = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}?hash=${token}`;
  navigator.clipboard.writeText(link);
});

function randomString(digit) {
  let text = '',
    base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < digit; i++)
    text += base64Chars.charAt(Math.floor(Math.random() * base64Chars.length));
  return text;
}

function whoAmI() {
  return isHost;
}