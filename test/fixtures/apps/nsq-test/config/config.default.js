'use strict';

exports.keys = '123456';
exports.nsqjs = {
  reader: {
    lookupdHTTPAddresses: '127.0.0.1:4161',
    sub: {
      TestTopic: {
        topic: 'Test.Topic',
        channel: 'device_update',
      },
    },
  },
  writer: {
    nsqdHost: '127.0.0.1',
    nsqdPort: 4150,
  },
};
