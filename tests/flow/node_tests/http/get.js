// @flow

const http = require('http');
const url = 'http://nodejs.org/dist/index.json';

http.get({});
http.get({host: 'localhost'});
http.get(url);
http.get(url, () => {});
http.get(url, {}, () => {});
http.get(url, {host: 'localhost'}, () => {});

http.get(-1); // error
http.get({port: 'expects number'}); // error
http.get(url, {}, -1); // error
http.get(url, {port: 'expects number'}, () => {}); // error
