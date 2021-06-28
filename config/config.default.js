'use strict';

/**
 * egg-nsq default config
 * @member Config#nsqjs
 * @property {String} SOME_KEY - some description
 */
exports.nsqjs = {
  reader: {
    lookupdHTTPAddresses: 'YOUR_HOST:PORT', // string or array of strings
    sub: {
      // key is subscription code file name
      key: {
        //   topic: '',
        //   channel: '',
        //   // more options refer to the document of nsqjs Reader.
        //   opts: {},
      },
    },
  },
  writer: {
    nsqdHost: 'YOUR_HOST',
    nsqdPort: 4150,
    // more options refer to the document of nsqjs Writer.
    // options:{}
  },
};
