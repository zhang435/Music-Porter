var crypto = require('crypto')
var base = require("./repo.js")
var Redis = require('ioredis')
var merge = require('utils-merge')

function RedisRepo(options) {
    this.cache = Object.create(null);
    var defaultOptions = {
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        family: 4, // 4 (IPv4) or 6 (IPv6)
        password: ''
    }

    var options = merge(defaultOptions, options);
    this.redis = new Redis(options);
    this.appName = options.appName || 'seenreq';
    this.clearOnQuit = options.clearOnQuit !== false;
}

RedisRepo.prototype = Object.create(base.prototype);
RedisRepo.prototype.constructor = RedisRepo;

/*
    @param opt(array of object) 
        {
            sign: "GET http://www.baidu.com/\r\n",
            update: true
        }
    @return rst(array of boolean), each element denotes the existence of corresponding object in opt
 */
RedisRepo.prototype.exists = function(opt, callback) {
    var self = this,
        req = opt,
        slots = {},
        uniq = [],
        keysToInsert = {};

    var hash = function(str) {
        var hashFn = crypto.createHash('md5');
        hashFn.update(str);
        return hashFn.digest('hex');
    }

    var rst = new Array(req.length);

    for (var i = 0; i < req.length; i++) {
        var key = hash(req[i].sign);
        if (key in slots) {
            rst[i] = true;
        } else {
            rst[i] = false;
            slots[key] = i;
            if (req[i].update === true) {
                keysToInsert[key] = null;
            }
            uniq.push(key);
        }
    }

    this.redis.hmget(this.appName, uniq, function(err, result) {
        if (err)
            return callback(err);

        for (var j = 0; j < uniq.length; j++) {
            if (result[j] == '1') {
                rst[slots[uniq[j]]] = true;
                delete keysToInsert[uniq[j]];
            } else {
                rst[slots[uniq[j]]] = false;
            }
        }

        keysToInsert = Object.keys(keysToInsert).reduce(function(total, key) {
            total.push(key, 1);
            return total;
        }, []);

        if (keysToInsert.length === 0) {
            return callback(null, rst);
        }

        self.redis.hmset(self.appName, keysToInsert, function(err) {
            if (err)
                return callback(err);

            callback(null, rst);
        });
    });
}

RedisRepo.prototype.dispose = function() {
    var self = this;
    if (this.clearOnQuit) {
        this.redis.del(this.appName, function(err, result) {
            if (err)
                throw err;

            self.redis.quit();
        })
    } else {
        self.redis.quit();
    }
}

module.exports = RedisRepo;