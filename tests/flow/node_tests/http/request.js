// @flow

const http = require('http');
const url = 'http://nodejs.org/dist/index.json';

http.request({});
http.request({host: 'localhost'});
http.request(url);
http.request(url, () => {});
http.request(url, {}, () => {});
http.request(url, {host: 'localhost'}, () => {});

http.request(-1); // error
http.request({port: 'expects number'}); // error
http.request(url, {}, -1); // error
http.request(url, {port: 'expects number'}, () => {}); // error
