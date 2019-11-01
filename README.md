# egg-nsq-js

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-nsq-js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-nsq-js
[travis-image]: https://img.shields.io/travis/eggjs/egg-nsq-js.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-nsq-js
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-nsq-js.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-nsq-js?branch=master
[download-image]: https://img.shields.io/npm/dm/egg-nsq-js.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-nsq-js

nsq client protocol based on [nsqjs](https://github.com/dudleycarr/nsqjs) for egg framework

## Install

```bash
$ npm i egg-nsq-js --save
```

## Usage

Enable the nsqjs plugin

```js
// {app_root}/config/plugin.js
exports.nsq = {
  enable: true,
  package: 'egg-nsq-js',
};
```

In controller/service, you can use `app.nsqjs` or `ctx.nsqjs` to get the nsqjs instance

### nsqjs

- `publish(msg)`

## Configuration

```js
// {app_root}/config/config.default.js
exports.nsq = {
    default:{
        host:'',
        nsqlookupd_port:,

    },
    sub:[
        {
            topic:'',
            channel:'',
            // opts:{}
        }
    ]
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

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
