'use strict';

exports.keys = '123456';
exports.nsqjs = {
  default: {
    host: '127.0.0.1',
    nsqlookupd_port: 4150,
    nsqd_port: 4161,
  },
  sub: [
    {
      topic: 'Test.Topic',
      channel: 'device_update',
    },
  ],
};
