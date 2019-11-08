# egg-jsnsq

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-jsnsq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-jsnsq
[travis-image]: https://img.shields.io/travis/clanaid/egg-jsnsq.svg?style=flat-square
[travis-url]: https://travis-ci.org/clanaid/egg-jsnsq
[codecov-image]: https://img.shields.io/codecov/c/github/clanaid/egg-jsnsq.svg?style=flat-square
[codecov-url]: https://codecov.io/github/clanaid/egg-jsnsq?branch=master
[download-image]: https://img.shields.io/npm/dm/egg-jsnsq.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-jsnsq

nsq client protocol based on [nsqjs](https://github.com/dudleycarr/nsqjs) for egg framework

## Install

```bash
$ npm i egg-jsnsq --save
```

## Usage

Enable the nsqjs plugin

```js
// {app_root}/config/plugin.js
exports.nsqjs = {
  enable: true,
  package: 'egg-jsnsq',
};
```

In controller/service, you can use `app.nsqjs` or `ctx.nsqjs` to get the nsqjs instance

### nsqjs

- `publish(msg: Message)`

  publish a message or a list of messages to the connected nsqd.

  `msg.msgs` is either a string, a `Buffer`, JSON serializable object, a list of strings / `Buffers` / JSON serializable objects. See [nsqjs.Writer](https://github.com/dudleycarr/nsqjs)

  ```js
  interface Message {
    topic: String;
    msgs: any;
  }
  ```

* `deferPublish(msg: Message, timeMs: Number)`

  publish a message to the connected nsqd with delay. `timeMs` is the delay by which the message should be delivered.

## Configuration

```js
// {app_root}/config/config.default.js
exports.nsq = {
  reader: {
    host: 'YOUR_HOST',
    http_port: 4161,
    sub: [
      {
        topic: '',
        channel: '',
      },
    ],
  },
  writer: {
    host: 'YOUR_HOST',
    port: 4150,
  },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

### Subscriber

put your subscription codes under the folder `{app_root}/app/nsq` and named as the topic name e.g `Test.Topic.js`

```
.
├── app
│   ├── nsq
│   │   └── Test.Topic.js
│   ├── public
│   └── router.js
├── config
│   └── config.default.js
├── package.json
```

the export of the subscription code can be a class or function/asyncFunction

- **class**

  should implment a subscriber as blow

  ```js
  class Subscribe {
    constructor(ctx) {
      this.ctx = ctx;
    }

    async subscribe(msg) {
      // enter your code
    }
  }

  module.exports = Subscribe;
  ```

* **function**

  ```js
  module.exports = async (ctx, msg) => {
    // enter your code
  };
  ```

  received msg will be an`JSON Object` (If it can be resolved) or `Buffer`

## Questions & Suggestions

Please open an issue [here](https://github.com/clanaid/egg-jsnsq/issues).

## License

[MIT](LICENSE)
