'use strict';

exports.keys = '123456';
exports.nsqjs = {
  reader: {
    host: '127.0.0.1',
    http_port: 4161,
    sub: [
      {
        topic: 'Test.Topic',
        channel: 'device_update',
      },
    ],
  },
  writer: {
    host: '127.0.0.1',
    port: 4150,
  },
};
