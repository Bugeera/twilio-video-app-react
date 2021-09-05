'use strict';

/**
 * Load Twilio configuration from .env config file - the following environment
 * variables should be set:
 * process.env.TWILIO_ACCOUNT_SID
 * process.env.TWILIO_API_KEY
 * process.env.TWILIO_API_SECRET
 */
require('dotenv').load();

const express = require('express');
const http = require('http'),
  https = require('https');
const path = require('path');
const { jwt: { AccessToken } } = require('twilio');
const ejwt = require('express-jwt');
const fs = require('fs');

const options = {
  key: fs.readFileSync(path.resolve('./server/certs/privkey.pem')),
  cert: fs.readFileSync(path.resolve('./server/certs/fullchain.pem'))
};

const VideoGrant = AccessToken.VideoGrant;

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
const MAX_ALLOWED_SESSION_DURATION = 14400;

// Create Express webapp.
const PORT = process.env.PORT ?? 3000;
const app = express();
app.use(express.json());


// Set up the paths for the examples.
[
  // 'bandwidthconstraints',
  // 'codecpreferences',
  // 'dominantspeaker',
  // 'localvideofilter',
  // 'localvideosnapshot',
  // 'mediadevices',
  // 'networkquality',
  // 'reconnection',
  'screenshare',
  'tour',
  // 'localmediacontrols',
  // 'remotereconnection',
  // 'datatracks',
  // 'manualrenderhint',
  // 'autorenderhint'
].forEach(example => {
  const examplePath = path.join(__dirname, `../examples/${example}/public`);
  app.use(`/${example}`, express.static(examplePath));
});

// const tourPath = path.join(__dirname, `../examples/tourview/public`);
// app.use(`/tour`, express.static(tourPath));

// // Set up the path for the quickstart.
const quickstartPath = path.join(__dirname, '../quickstart/public');
app.use('/quickstart', express.static(quickstartPath));
app.use('/meeting', express.static(quickstartPath));

// Set up the path for the examples page.
const examplesPath = path.join(__dirname, '../examples');
app.use('/examples', express.static(examplesPath));

/**
 * Default to the Quick Start application.
 */
app.get('/', (request, response) => {
  response.redirect('/tour');
});

app.all('/middleware', ejwt({
  secret: '!n|)I^',
  algorithms: ['HS256'],
  requestProperty: 'payload',
  getToken: req => ((req.query || {}).hash || '')
}), (req, res, next) => {
  if (!req.payload) return res.sendStatus(404);
  // res.status(200).send({ message: 'OK' });
  // res.redirect(`/meeting?hash=${t}`);
  if (req.payload.host && !req.payload.roomId) {
    res.redirect(`/meeting?hash=.${req.payload.host}`);
    // res.redirect(`/screenshare?hash=.${req.payload.host}`);
  } else {
    res.redirect(`/meeting?hash=.${req.payload.host}&room=${req.payload.roomId}`);
    // res.redirect(`/screenshare?hash=.${req.payload.host}&room=${req.payload.roomId}`);
  }
});

const middleware = (req, res, next) => {

}

/**
 * Generate an Access Token for a chat application user - it generates a random
 * username for the client requesting a token, and takes a device ID as a query
 * parameter.
 */
app.get('/token', function (request, response) {
  const { identity } = request.query;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID || 'ACae607e3502fd3e5c9863a81a6cee287d',
    process.env.TWILIO_API_KEY || 'SKec95353ef6bf793a21eacffeb45d13c0',
    process.env.TWILIO_API_SECRET || 'jTcMJGXyfK7yZgiFCwhjtXLr6wGHvbSr',
    { ttl: MAX_ALLOWED_SESSION_DURATION }
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  const grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string.
  response.send(token.toJwt());
});

// Create http server and run it.
// const server = http.createServer(app);
// const port = process.env.PORT || 3000;
// server.listen(port, function () {
//   console.log('Express server running on *:' + port);
// });


const httpsServer = https.createServer(options, app).listen(PORT, () => {
  console.log("Express server is listening on port: " + PORT);
});
const httpServer = http.createServer({}, (req, res) => {
  res.writeHead(301, { "Location": `https://${(req.headers || {}).host.split(':')[0]}:${PORT}` + req.url });
  res.end();
}).listen(8080);

module.exports = { httpsServer, httpServer, app };


