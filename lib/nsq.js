'use strict';

const assert = require('assert');
const path = require('path');
const is = require('is-type-of');
const { Message, Reader, Writer } = require('nsqjs');
const TAG = '[egg-nsqjs]';

const createReader = Symbol('createReader');
const createWriter = Symbol('createWriter');
const readerCache = Symbol('readerCache');
const subscriberCache = Symbol('subscriberCacneh');
const nsqSubscribers = Symbol('NsqSubscribers');

class NSQ {
  constructor(app) {
    this.app = app;
    this.logger = app.coreLogger;
    this.config = app.config.nsqjs;
    this[readerCache] = new Map();
    this[subscriberCache] = new Map();
  }

  get readerMap() {
    return this[readerCache];
  }

  async init() {
    const { app, config } = this;
    assert(
      config.reader && config.reader.lookupdHTTPAddresses,
      `${TAG} reader configuration is required`
    );
    const directory = path.join(app.config.baseDir, 'app/nsq');
    app.loader.loadToApp(directory, nsqSubscribers, {
      caseStyle: 'upper',
      call: false,
    });

    if (config.writer) {
      assert(
        config.writer.nsqdHost && config.writer.nsqdPort,
        `${TAG} nsqd host or port is required`
      );
      this.logger.info(TAG, 'create nsqjs writer');
      const writer = await this[createWriter](config.writer);
      this.writer = writer;
    }

    this.logger.info(TAG, 'create nsqjs readers');
    for (const key in config.reader.sub) {
      const opts = config.reader.sub[key];
      this[createReader]({
        key,
        lookupdHTTPAddresses: config.reader.lookupdHTTPAddresses,
        ...opts,
      });
    }
  }

  async [createReader]({ key, topic, channel, lookupdHTTPAddresses, ...opts }) {
    const { app, logger } = this;
    assert(topic && channel, `${TAG} reader topic channel is required`);
    const options = { lookupdHTTPAddresses, ...opts };
    assert(!this.readerMap.has(key), `${TAG} duplicate reader topic=${topic}, channel=${channel}`);
    const SubscriberCache = this[subscriberCache];
    const subscribers = app[nsqSubscribers];
    const ctx = app.createAnonymousContext();
    return new Promise((resolve, reject) => {
      const reader = new Reader(topic, channel, options);
      this.readerMap.set(key, reader);

      reader.on(Reader.MESSAGE, async (msg) => {
        let subscriber = SubscriberCache.get(key);
        if (!subscriber) {
          subscriber = getInstance({ key, subscribers, ctx, logger });
          SubscriberCache.set(key, subscriber);
        }
        if (subscriber) {
          let value;
          try {
            value = msg.json();
          } catch (err) {
            value = msg.body;
          }
          const message = { id: msg.id, value };
          if (
            is.function(subscriber) ||
            is.asyncFunction(subscriber) ||
            is.generatorFunction(subscriber)
          ) {
            process.nextTick(subscriber, ctx, message);
          } else {
            process.nextTick(subscriber.subscribe, message);
          }
          msg.finish();
        } else logger.error(TAG, `not found subscriber can\'t reslove topic=${topic}`);
      });

      reader.on('nsqd_connected', () => {
        logger.info(TAG, `topic: ${topic}, channel: ${channel} subscribe success`);
        resolve();
      });

      reader.on('error', (err) => {
        reject(err);
      });

      reader.on('nsqd_closed', (host, port) => {
        logger.info(TAG, `close reader ${host}:${port}`);
      });

      reader.connect();
    });
  }

  async [createWriter](opts) {
    return new Promise((resolve, reject) => {
      const writer = new Writer(opts.host, opts.port || 4150, opts.options);

      writer.on(Writer.READY, () => resolve(writer));

      writer.on(Writer.ERROR, (err) => reject(err));

      writer.on('closed', () => reject(new Error('writer closed')));

      writer.connect();
    });
  }

  async publish(msg) {
    assert(this.writer, `${TAG} writer not create`);
    assert(msg.topic && msg.msgs, `${TAG} msg is required`);
    const { topic, msgs } = msg;
    const writer = this.writer;
    return new Promise((resolve, reject) => {
      writer.publish(topic, msgs, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deferPublish(msg, timeMs) {
    assert(this.writer, `${TAG} writer not create`);
    assert(msg.topic && msg.msgs, `${TAG} msg is required`);
    assert(timeMs, `${TAG} timeMs is required`);
    const { topic, msgs } = msg;
    return new Promise((resolve, reject) => {
      this.writer.deferPublish(topic, [JSON.stringify(msgs)], timeMs, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async closeReaders() {
    this[readerCache].forEach((reader) => reader.close());
    this[readerCache].clear();
    if (this.writer) this.writer.close();
  }

  version() {
    return require('../package.json').version;
  }
}

function getInstance({ subscribers, key, ctx, logger }) {
  const Class = subscribers[key];
  if (!Class) {
    logger.warn(TAG, `can't found key=${key} subscriber file`);
    return null;
  }
  const EXPORTS = Object.getOwnPropertySymbols(Class)
    .filter((smb) => smb.toString() === 'Symbol(EGG_LOADER_ITEM_EXPORTS)')
    .map((smb) => Class[smb])[0];
  assert(EXPORTS, `${TAG} key=${key} subscriber need export function or class`);
  let instance;
  if (is.class(Class)) {
    instance = new Class(ctx);
  } else {
    instance = Class;
  }
  return instance;
}

module.exports = NSQ;
exports.Message = Message;
