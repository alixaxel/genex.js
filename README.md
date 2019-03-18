# genex

[![genex](https://img.shields.io/npm/v/genex.svg?style=for-the-badge)](https://www.npmjs.com/package/genex)
[![Donate](https://img.shields.io/badge/donate-paypal-orange.svg?style=for-the-badge)](https://paypal.me/alixaxel)

Expands any given regular expression into all the possible strings that it would be able to match.

## Install

```shell
npm i genex --save
```

## Usage

```js
const genex = require('genex');
const pattern = genex(/(foo|bar|baz){1,2}|snafu/);

// 13
console.log(pattern.count());

/*
[
  'foo', 'foofoo', 'foobar', 'foobaz',
  'bar', 'barfoo', 'barbar', 'barbaz',
  'baz', 'bazfoo', 'bazbar', 'bazbaz',
  'snafu'
]
*/
console.log(pattern.generate());
```

## License

MIT
