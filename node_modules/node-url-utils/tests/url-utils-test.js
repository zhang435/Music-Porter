var vows = require("vows"),
	assert = require("assert");

var	utils = require("../lib/url-utils");
var normalize = utils.normalize;
var equals = utils.equals;

vows.describe("URL normalize test suite").addBatch({
	"If there is an unknown protocol": {
		topic: normalize("http:example.com"),
		"then return null": function(url) {
			assert.isNull(url);
		}
	},
	"If there is an uppercase hostname": {
		topic: normalize("http://EXAMPLE.COM/"),
		"then convert it to lower case": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If there is no path": {
		topic: normalize("http://example.com"),
		"then add a trailing slash": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If the path contains .'s and ..'s": {
		topic: normalize("http://example.com/./../dir1/../dir2/./dir3/."),
		"then resolve the path and remove them": function(url) {
			assert.equal(url, "http://example.com/dir2/dir3/");
		}
	},
	"If the last path segment is a file": {
		topic: normalize("http://example.com/dir1/file.txt"),
		"then do not add a trailing slash": function(url) {
			assert.equal(url, "http://example.com/dir1/file.txt");
		}
	},
/*	"If the last path segment is a directory and not a file": {
		topic: normalize("http://example.com/dir1/dir2"),
		"then add a trailing slash": function(url) {
			assert.equal(url, "http://example.com/dir1/dir2/");
		}
	}, */
	"If path contains escape sequences": {
		topic: normalize("http://example.com/%3aa%7d%7B/"),
		"then capitalize them": function(url) {
			assert.equal(url, "http://example.com/%3Aa%7D%7B/");
		}
	},
	"If path contains unneeded escape sequences": {
		topic: normalize("http://www.example.com/%7Eusername/"),
		"then decode them": function(url) {
			assert.equal(url, "http://www.example.com/~username/");
		}
	},
	"If the URL points to an index file": {
		topic: normalize("http://example.com/index.html", {removeIndex: true}),
		"then remove the file from the URL": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If there is an empty query": {
		topic: normalize("http://example.com/?"),
		"then remove the question mark": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If the query contains a PHP session key": {
		topic: normalize("http://example.com/?PHPSESSID=foobar"),
		"then remove it": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If the query contains utm_* keys": {
		topic: normalize("http://example.com/?utm_source=foobar&utm_medium=foobar&utm_term=foobar&utm_content=foobar&utm_campaign=foobar"),
		"then remove them": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If there are additional keys to remove": {
		topic: normalize("http://example.com/?foo=bar1&foo=bar2&key1=val1&key2=val2", {
			removeKeys: ["foo", "key2"]
		}),
		"then remove them": function(url) {
			assert.equal(url, "http://example.com/?key1=val1");
		}
	},
	"If the query contains uppercase keys": {
		topic: normalize("http://example.com/?Key=Value"),
		"then do not lower case them": function(url) {
			assert.equal(url, "http://example.com/?Key=Value");
		}
	},
	"If the query contains multiple keys": {
		topic: normalize("http://example.com/?key2=val2&key1=val1&foo=bar2&foo=bar1"),
		"then sort them": function(url) {
			assert.equal(url, "http://example.com/?foo=bar1&foo=bar2&key1=val1&key2=val2");
		}
	},
	"If the query contains escape sequences": {
		topic: normalize("http://example.com/?%3a=%7d%7B"),
		"then capitalize them": function(url) {
			assert.equal(url, "http://example.com/?%3A=%7D%7B");
		}
	},
	"If there is a hash fragment": {
		topic: normalize("http://example.com/#Foobar"),
		"then keep it": function(url) {
			assert.equal(url, "http://example.com/#Foobar");
		}
	},
	"If there is an empty hash fragment": {
		topic: normalize("http://example.com/#"),
		"then remove it": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If query use RFC 1738 plus encoding to represent spaces": {
		topic: normalize("http://example.com/hello+world/?a=b+c#d+e"),
		"then replace these with RFC 3986 percent encoding": function(url) {
			assert.equal(url, "http://example.com/hello%2Bworld/?a=b%20c#d+e");
		}
	},
	"If an HTTP-URL contains the default port": {
		topic: normalize("http://example.com:80/"),
		"then remove it": function(url) {
			assert.equal(url, "http://example.com/");
		}
	},
	"If an HTTPS-URL contains the default port": {
		topic: normalize("https://example.com:443/"),
		"then remove it": function(url) {
			assert.equal(url, "https://example.com/");
		}
	},
	"If there is a non-default port": {
		topic: normalize("http://example.com:1234/"),
		"then do not remove it": function(url) {
			assert.equal(url, "http://example.com:1234/");
		}
	}
}).export(module);

vows.describe("URL equals test suite").addBatch({
	"If two normalized URLs are equal": {
		topic: equals("http://example.com", "http://example.com/"),
		"then return true": function(ret) {
			assert.isTrue(ret);
		}
	},
	"If two normalized URLs are not equal": {
		topic: equals("https://example.com", "http://example.com"),
		"then return false": function(ret) {
			assert.isFalse(ret);
		}
	}
}).export(module);
