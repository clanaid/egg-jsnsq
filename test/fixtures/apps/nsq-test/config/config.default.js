'use strict';

exports.keys = '123456';
exports.nsqjs = {
  default: {
    host: '127.0.0.1',
    nsqlookupd_http_port: 4161,
    nsqd_tcp_port: 4150,
  },
  sub: [
    {
      topic: 'Test.Topic',
      channel: 'device_update',
    },
  ],
};
