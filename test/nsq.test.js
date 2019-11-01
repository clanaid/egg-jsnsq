'use strict';

const mock = require('egg-mock');
const assert = require('assert');

describe('test/nsq.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/nsq-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app
      .httpRequest()
      .get('/')
      .expect('hi, nsq')
      .expect(200);
  });

  it('test get nsq by context', () => {
    const ctx = app.mockContext();
    assert(ctx.nsqjs.version() === '1.0.0');
  });

  it('test publish and subscribe', async () => {
    await app
      .httpRequest()
      .get('/getmessage')
      .expect('ok')
      .expect(200);
  });
});
