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
    assert(config.reader && config.reader.host, `${TAG} reader configuration is required`);
    this.lookupdHTTPAddresses = `${config.reader.host}:${config.reader.http_port || 4161}`;
    const directory = path.join(app.config.baseDir, 'app/nsq');
    app.loader.loadToApp(directory, 'nsqSubscribers', {
      caseStyle(filepath) {
        return filepath.substring(0, filepath.lastIndexOf('.')).split('/');
      },
      call: false,
    });

    if (config.writer) {
      assert(config.writer.host && config.writer.port, `${TAG} nsqd host or port is required`);
      this.logger.info(TAG, 'create nsqjs writer');
      const writer = await this[createWriter](config.writer);
      this.writer = writer;
      this.nsqdTCPAddresses = `${config.writer.host}:${config.writer.port || 4150}`;
    }

    this.logger.info(TAG, 'create nsqjs readers');
    for (const opts of config.reader.sub) {
      await this[createReader](opts);
    }
  }

  async [createReader]({ topic, channel, opts = {} }) {
    const { app, logger, lookupdHTTPAddresses, nsqdTCPAddresses } = this;
    assert(topic && channel, `${TAG} reader topic channel is required`);
    const options = { ...opts, lookupdHTTPAddresses, nsqdTCPAddresses };
    const key = `${topic}-${channel}`;
    assert(!this.readerMap.has(key), `${TAG} duplicate reader topic=${topic}, channel=${channel}`);
    const SubscriberCache = this[subscriberCache];
    const subscribers = app.nsqSubscribers;
    const ctx = app.createAnonymousContext();
    return new Promise((resolve, reject) => {
      const reader = new Reader(topic, channel, options);
      this.readerMap.set(key, reader);

      reader.on(Reader.MESSAGE, async msg => {
        let subscriber = SubscriberCache.get(topic);
        if (!subscriber) {
          subscriber = getInstance({ topic, subscribers, ctx, logger });
          SubscriberCache.set(topic, subscriber);
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
            subscriber(ctx, message);
          } else {
            subscriber.subscribe(message);
          }
          msg.finish();
        } else logger.error(TAG, `not found subscriber can\'t reslove topic=${topic}`);
      });

      reader.on('nsqd_connected', () => {
        logger.info(TAG, `topic: ${topic}, channel: ${channel} subscribe success`);
        resolve();
      });

      reader.on('error', err => {
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

      writer.on(Writer.ERROR, err => reject(err));

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
      writer.publish(topic, msgs, err => {
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
      this.writer.deferPublish(topic, [JSON.stringify(msgs)], timeMs, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async closeReaders() {
    this[readerCache].forEach(reader => reader.close());
    this[readerCache].clear();
    if (this.writer) this.writer.close();
  }

  version() {
    return require('../package.json').version;
  }
}

function getInstance({ subscribers, topic, ctx, logger }) {
  const Class = subscribers[topic];
  if (!Class) {
    logger.warn(TAG, `can't found topic=${topic} subscriber file`);
    return null;
  }
  const EXPORTS = Object.getOwnPropertySymbols(Class)
    .filter(smb => smb.toString() === 'Symbol(EGG_LOADER_ITEM_EXPORTS)')
    .map(smb => Class[smb])[0];
  assert(EXPORTS, `${TAG} topic=${topic} subscriber need export function or class`);
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
