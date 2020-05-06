// @flow

const https = require('https');
const url = 'http://nodejs.org/dist/index.json';

https.get({});
https.get({host: 'localhost'});
https.get(url);
https.get(url, () => {});
https.get(url, {}, () => {});
https.get(url, {host: 'localhost'}, () => {});

https.get(-1); // error
https.get({port: 'expects number'}); // error
https.get(url, {}, -1); // error
https.get(url, {port: 'expects number'}, () => {}); // error
