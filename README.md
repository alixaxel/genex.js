genex.js
--------

Genex module for Node.js

Usage
-----

```js
var genex = require('genex');

var regex = /(foo|bar|baz)\d\1/;
var count = genex(regex).count();

if (count <= 1000) {
	genex(regex).generate(function (output) {
		console.log('[*] ' + output);
	});
}

console.log('Total strings generated: ' + count);
```

Install
-------

	npm install genex

License
-------

MIT
