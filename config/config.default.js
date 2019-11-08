'use strict';

/**
 * egg-nsq default config
 * @member Config#nsqjs
 * @property {String} SOME_KEY - some description
 */
exports.nsqjs = {
  reader: {
    host: 'YOUR_HOST',
    http_port: 4161,
    sub: [
      // {
      //   topic: '',
      //   channel: '',
      //   // more options refer to the document of nsqjs Reader.
      //   opts: {},
      // },
    ],
  },
  writer: {
    host: 'YOUR_HOST',
    port: 4150,
    // more options refer to the document of nsqjs Writer.
    // options:{}
  },
};
