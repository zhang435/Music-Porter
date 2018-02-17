URL utilities for node.js
============================================

This node.js module provides several utility methods that can be useful while working with URLs.
The standard URL module of node.js is there extended with some new methods:

- `normalize` Normalize an URL.
- `equals` Compare to URLs after normalization.

This module is still under development. There are some utility methods missing (e.g. validation).

## Requirements

- Node.js >= 0.2.1 (tested with 0.2.1)
- Vows (only for unit testing)

## How to use

	var url = require("./lib/url-utils");
	console.log(url.normalize("http://example.com/dir/../dir"));
	console.log(url.normalize("http://example.com/?important=true&random=358103412461", {
		removeKeys: ["random"]
	}));
	console.log(url.equals("http://example.com", "http://example.com:80/"));

In order to run the tests, install `Vows` and run with `make`:

	npm install vows
	cd node-url-utils/
	make test

## Credits

- Mario Volke ([mariovolke.com](http://mariovolke.com))
- Lovell Fuller ([lovell.info](http://lovell.info/))
- Mitar ([github.com/mitar](https://github.com/mitar))

## License

(The MIT License)

Copyright (c) 2010 Mario Volke &lt;info@mariovolke.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
