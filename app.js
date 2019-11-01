'use strict';

const NSQ = require('./lib/nsq');
class AppBootHook {
  constructor(app) {
    app.nsqjs = new NSQ(app);
    this.app = app;
  }

  async didLoad() {
    this.app.nsqjs.init();
  }


  async beforeClose() {
    this.app.nsqjs.closeReaders();
  }
}

module.exports = AppBootHook;
