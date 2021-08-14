import './bootstrap-globals';
import { createExpressHandler } from './createExpressHandler';
import express, { RequestHandler } from 'express';
import path from 'path';
import { ServerlessFunction } from './types';
import https from 'https';
import http from 'http';
import fs from 'fs';

const options = {
    key: fs.readFileSync(path.resolve('./server/certs/3d.key')),
    cert: fs.readFileSync(path.resolve('./server/certs/3d.crt'))
};
const PORT = process.env.PORT ?? 8081;

const app = express();
app.use(express.json());

// This server reuses the serverless endpoints from the "plugin-rtc" Twilio CLI Plugin, which is used when the "npm run deploy:twilio-cli" command is run.
// The documentation for this endpoint can be found in the README file here: https://github.com/twilio-labs/plugin-rtc
const tokenFunction: ServerlessFunction = require('@twilio-labs/plugin-rtc/src/serverless/functions/token').handler;
const tokenEndpoint = createExpressHandler(tokenFunction);

const recordingRulesFunction: ServerlessFunction = require('@twilio-labs/plugin-rtc/src/serverless/functions/recordingrules')
  .handler;
const recordingRulesEndpoint = createExpressHandler(recordingRulesFunction);

const noopMiddleware: RequestHandler = (_, __, next) => next();
const authMiddleware =
  process.env.REACT_APP_SET_AUTH === 'firebase' ? require('./firebaseAuthMiddleware') : noopMiddleware;

app.all('/token', authMiddleware, tokenEndpoint);
app.all('/recordingrules', authMiddleware, recordingRulesEndpoint);

app.use((req, res, next) => {
  // Here we add Cache-Control headers in accordance with the create-react-app best practices.
  // See: https://create-react-app.dev/docs/production-build/#static-file-caching
  if (req.path === '/' || req.path === 'index.html') {
    res.set('Cache-Control', 'no-cache');
  } else {
    res.set('Cache-Control', 'max-age=31536000');
  }
  next();
});
app.use('/.well-known', express.static(path.join(__dirname, './.well-known')));
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (_, res) => {
  // Don't cache index.html
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// app.listen(PORT, () => console.log(`twilio-video-app-react server running on ${PORT}`));

const httpsServer = https.createServer(options, app).listen(PORT, ()=> {
  console.log("Express server is listening on port: " + PORT);
});
const httpServer = http.createServer({}, (req:any, res:any) => {
  app.locals.hi = '';
  res.writeHead(301, { "Location": `https://${(req.headers || {}).host.split(':')[0]}:${PORT}` + req.url });
  res.end();
}).listen(8080);

module.exports = { httpsServer, httpServer, app };