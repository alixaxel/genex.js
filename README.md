genex.js
--------
[![NPM Version](https://img.shields.io/npm/v/genex.svg)](https://www.npmjs.org/package/genex)
[![NPM Downloads](https://img.shields.io/npm/dm/genex.svg)](https://www.npmjs.org/package/genex)

Genex (regular expression expansion) module for Node.js

Usage
-----

```js
var genex = require('genex');

var regex = /(foo|bar|baz){1,2}\d/;
var count = genex(regex).count();

if (count <= 1000) {
    genex(regex).generate(function (output) {
        console.log('[*] ' + output);
    });
}

console.log('Total strings generated: ' + count);
```

Output
------

```
[*] foo0
[*] ...
[*] foo9
[*] foofoo0
[*] ...
[*] foofoo9
[*] foobar0
[*] ...
[*] foobar9
[*] foobaz0
[*] ...
[*] foobaz9
[*] bar0
[*] ...
[*] bar9
[*] barfoo0
[*] ...
[*] barfoo9
[*] barbar0
[*] ...
[*] barbar9
[*] barbaz0
[*] ...
[*] barbaz9
[*] baz0
[*] ...
[*] baz9
[*] bazfoo0
[*] ...
[*] bazfoo9
[*] bazbar0
[*] ...
[*] bazbar9
[*] bazbaz0
[*] ...
[*] bazbaz9

Total strings generated: 120
```

Install
-------

    npm install genex --save

License
-------

MIT
