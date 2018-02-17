exports = module.exports = require("url");

if(!exports.normalize) {
exports.normalize = function(url, options) {
	var u = exports.parse(url);

	// basic validation
	// (If you really need to validate the URL then do it before calling this method!)
	if(!/(http|https)/.test(u.protocol) || !u.slashes) {
		return null;
	}

	// optional options
	options = options || {};

	// convert hostname to lower case
	u.hostname = u.hostname.toLowerCase();

	// add trailing slash if not set
	if(!u.pathname) {
		u.pathname = "/";
	}
	else {
		// remove dots as described in
		// http://tools.ietf.org/html/rfc3986#section-5.2.4
		var ibuf = u.pathname;
		var obuf = "";
		while(ibuf.length) {
			if(ibuf.substr(0, 2) == "./") {
				ibuf = ibuf.substr(2);
			}
			else if(ibuf.substr(0, 3) == "../") {
				ibuf = ibuf.substr(3);
			}
			else if(ibuf.substr(0, 3) == "/./") {
				ibuf = "/" + ibuf.substr(3);
			}
			else if(ibuf == "/.") {
				ibuf = "/";
			}
			else if(ibuf.substr(0, 4) == "/../") {
				ibuf = "/" + ibuf.substr(4);
				var pos = obuf.lastIndexOf("/");
				if(pos !== -1) {
					obuf = obuf.substr(0, pos);
				}
			}
			else if(ibuf == "/..") {
				ibuf = "/";
				var pos = obuf.lastIndexOf("/");
				if(pos !== -1) {
					obuf = obuf.substr(0, pos);
				}
			}
			else if(ibuf == "." || ibuf == "..") {
				ibuf = "";
			}
			else {
				if(ibuf[0] == "/") {
					ibuf = ibuf.substr(1);
					obuf += "/";
				}
				var pos = ibuf.indexOf("/");
				if(pos !== -1) {
					obuf += ibuf.substr(0, pos);
					ibuf = ibuf.substr(pos);
				}
				else {
					obuf += ibuf;
					ibuf = "";
				}
			}
		}

		// if last path segment is a directory and not a file
		// then add a trailing slash

		// ATTENTION:
		// The following block would be part of the standard normalization procedure
		// but a lot of websites have problems with that. E.g. all bit.ly URLs are affected.

		/*var pos1 = obuf.lastIndexOf("/");
		var pos2 = obuf.lastIndexOf(".");
		if(pos1 < obuf.length-1 && pos2 < pos1) {
			obuf += "/";
		}*/

		// normalize escape sequences
		var segments = obuf.split("/");
		for (var i = 0; i < segments.length; i++) {
			segments[i] = encodeURIComponent(decodeURIComponent(segments[i]));
		}
		obuf = segments.join("/");

		if (options.removeIndex) {
			// remove directory index
			var pos1 = obuf.lastIndexOf("/");
			var pos2 = obuf.lastIndexOf(".");
			if(pos2 > pos1 && obuf.substring(pos1+1, pos2) == "index") {
				obuf = obuf.substr(0, pos1+1);
			}
		}

		u.pathname = obuf;
	}

	if(u.query) {
		var removeKeys = options.removeKeys || [
			"phpsessid",
			"utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign"
		];
		var seq = [];
		u.query.split("&").forEach(function(s) {
			var pair = s.split("=");
			var key = pair[0].toLowerCase();

			// remove unwanted params
			if(removeKeys.indexOf(key) > -1) return;

			// there might be multiple = if nonstandard, so go over all
			for (var i = 0; i < pair.length; i++) {
				// normalize encoding
				pair[i] = encodeURIComponent(decodeURIComponent(pair[i].replace(/\+/g, '%20')));
			}

			seq.push(pair.join("="));
		});

		// sort query keys in ascending order
		seq.sort();

		// rebuild query string
		u.query = seq.join("&");
	}

	// rebuild URL with fragment hash (#), user and password
	url = u.protocol + "//" + u.hostname;

	// ignore default port
	if(u.port && (
				(u.protocol == "http:" && u.port != 80) ||
				(u.protocol == "https:" && u.port != 443))) {
		url += ":" + u.port;
	}

	url += u.pathname;

	if(u.query) {
		url += "?" + u.query;
	}

	if(u.hash && u.hash.length > 1) {
		url += u.hash;
	}

	return url;
};
}

if(!exports.equals) {
exports.equals = function(url1, url2) {
	return exports.normalize(url1) === exports.normalize(url2);
};
}
