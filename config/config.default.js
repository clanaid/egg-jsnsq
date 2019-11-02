'use strict';

/**
 * egg-nsq default config
 * @member Config#nsqjs
 * @property {String} SOME_KEY - some description
 */
exports.nsqjs = {
  default: {
    host: '',
    nsqlookupd_http_port: '',
    nsqd_tcp_port: '',
    // more options refer to the document of nsqjs Writer.
    // options:{}
  },
  sub: [
    // {
    //   topic: '',
    //   channel: '',
    //   // more options refer to the document of nsqjs Reader.
    //   opts: {},
    // },
  ],
};
