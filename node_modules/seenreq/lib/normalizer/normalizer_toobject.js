'use strict'

var URL = require('node-url-utils')
var qs = require('querystring')
var merge = require('utils-merge')
var base = require('./normalizer.js')

/*
    options accepts two keys, other keys will be ignored:
    1. removeIndex(boolean): if true, if uri ends with "/index.*", "index.*" will be removed. e.g. http://github.com/index.php -> http://github.com/
    2. removeKeys(array of string): keys in query to be removed. e.g. removeKeys:['a','b'], http://github.com/index?a=1&b=2&c=3 -> http://github.com/index?c=3
 */
function Normalizer(options) {
    this.globalOptions = options || {};
}

Normalizer.prototype = Object.create(base.prototype);
Normalizer.prototype.constructor = Normalizer;

/*
 * Generate method + full uri + body string.
 *
 */
Normalizer.prototype.normalize = function(req, options) {
    var defaultreq = {
            method: "GET",
            body: null
        },
        opt = JSON.parse(JSON.stringify(defaultreq)),
        update = true;

    options = options || {};

    if (typeof req === 'string') {
        opt.uri = req;
    } else if (typeof req === 'object') {
        opt = merge(opt, req);
        opt.uri = opt.uri || opt.url;

        if (opt.seenreq_update === false) {
            update = false;
        }

        if (!URL.parse(opt.uri).search && opt.qs) {
            opt.uri = [opt.uri, typeof opt.qs === 'object' ? qs.stringify(opt.qs) : opt.qs].join("?");
        }

        if (opt.method === 'POST') {
            if (opt.json && typeof opt.body === 'object') { //only support one level Object
                var sorted = Object.keys(opt.body).map(k => [k, opt.body[k]]).sort(function(a, b) {
                    return a[0] === b[0] ? a[1] > b[1] : a[0] > b[0];
                }).reduce(function(pre, cur) {
                    pre[cur[0]] = cur[1];
                    return pre;
                }, Object.create(null));
                opt.body = JSON.stringify(sorted);
            } else if (typeof opt.form === 'object') {
                opt.body = Object.keys(opt.form).map(function(k) {
                    return [k, opt.form[k]].join("=");
                }).sort().join("&");
            } else if (typeof opt.form === 'string') {
                opt.body = opt.form.split("&").sort().join("&");
            }
        }
    } else {
        throw new Error("request should be String or Object.");
    }

    var opts = merge(this.globalOptions, options);
    if (!opts.hasOwnProperty("stripFragment") || opts.stripFragment) {
        opt.uri = opt.uri.replace(/#.*/g, '');
    }

    return {
        sign: [
            [opt.method, URL.normalize(opt.uri, opts)].join(" "), opt.body
        ].join("\r\n"),
        update: update
    };
}

module.exports = Normalizer;