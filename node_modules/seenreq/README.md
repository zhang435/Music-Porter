[![NPM](https://nodei.co/npm/seenreq.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/seenreq/)

[![build status](https://secure.travis-ci.org/mike442144/seenreq.png)](https://travis-ci.org/mike442144/seenreq)
[![Dependency Status](https://david-dm.org/mike442144/seenreq/status.svg)](https://david-dm.org/mike442144/seenreq)
# seenreq
A library to test if a url/request is crawled, usually used in a web crawler. Compatible with [request](https://github.com/request/request) and [node-crawler](https://github.com/bda-research/node-crawler)

# Install

    $ npm install seenreq

# Basic Usage

```javascript
var seenreq = require('seenreq')
var seen = new seenreq();

//url to be normalized
var url = "http://www.GOOGLE.com";
console.log(seen.normalize(url));//GET http://www.google.com/\r\n

//request options to be normalized
var option = {
    uri:'http://www.GOOGLE.com'
};

console.log(seen.normalize(option));//GET http://www.google.com/\r\n

//return false if ask for a `request` never see
console.log(seen.exists(url));//false

//return true if got same `request`
console.log(seen.exists(opt));//true
```
When you call `exists`, the module will do normalization itself first and then check if exists.

# Use Redis to store keys
`seenreq` default stores keys in memory, so process will use unlimited memory if there are unlimited keys. Redis will solve this problem. All `ioredis` options are recived and supported.

```javascript
var seenreq = require('seenreq')
var seen = new seenreq({
    repo:'redis',// use redis instead of memory
    host:'127.0.0.1',
    port:6379,
    clearOnQuit:false // default true.
});

var url = "http://www.GOOGLE.com";

//because of non-blocking I/O, you have to use a callback function to get result
seen.exists(url,{
    callback:function(err,result){
        if(err){
            console.error(err);
        }else{
            console.log(result);
        }
    }
});

```
Class:Seenreq
-------------

Instance of Seenreq

__seen.normalize(uri|option)__
 * `uri` String, `option` is Option of `request` or `node-webcrawler`. return normalized String.

__seen.exists(uri|option|[uri][,options])__
 * [options](#options), Warning: When using default `repo` if you call `exists` with an array of `uri` that have duplicate uris, the function won't remove.

__seen.dispose()__
 * dispose resources of repo. If you are using Redis and do not call `dispose` the connection will keep forever, that is your process will never exit.

Options
-----------------
 * removeKeys: Array, Ignore specified keys when doing normalization. For instance, there is a `ts` property in the url like `http://www.xxx.com/index?ts=1442382602504` which is timestamp and it should be same whenever you visit.
 * stripFragment: Boolean, Remove the fragment at the end of the URL (Default true).
 * update: Boolean, Store in repo so that `seenreq` can hit the `req` next time (Default true).
 * callback: Function, return result if using Redis repo.

# RoadMap
 * add `mysql` repo to persist keys to disk.
 * add keys life time management.
