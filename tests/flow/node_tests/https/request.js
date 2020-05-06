// @flow

const https = require('https');
const url = 'http://nodejs.org/dist/index.json';

https.request({});
https.request({host: 'localhost'});
https.request(url);
https.request(url, () => {});
https.request(url, {}, () => {});
https.request(url, {host: 'localhost'}, () => {});

https.request(-1); // error
https.request({port: 'expects number'}); // error
https.request(url, {}, -1); // error
https.request(url, {port: 'expects number'}, () => {}); // error
