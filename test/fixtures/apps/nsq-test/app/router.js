'use strict';

const assert = require('assert');

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
module.exports = app => {
  const { router, controller } = app;

  router.get('/', async ctx => {
    ctx.body = 'hi, nsq';
  });

  router.get('/getmessage', async ctx => {
    try {
      await ctx.nsqjs.publish({ topic: 'Test.Topic', msgs: { tag: 'test', body: 'test body' } });
    } catch (err) {
      assert.fail(err);
    }
    while (!ctx.app.nsqMsg.has('test')) {
      await sleep(100);
    }
    ctx.body = 'ok';
  });
};
