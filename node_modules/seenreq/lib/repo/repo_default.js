var crypto = require('crypto')
var base = require("./repo.js")

function MemRepo(options) {
    this.cache = Object.create(null);
}

MemRepo.prototype = Object.create(base.prototype);
MemRepo.prototype.constructor = MemRepo;

/*
    @param opt(array of object) 
        {
            sign: "GET http://www.baidu.com/\r\n",
            update: true
        }
    @return rst(array of boolean), each element denotes the existence of corresponding object in opt
 */
MemRepo.prototype.exists = function(opt, callback) {
    var req = opt;

    var hash = function(str) {
        var hashFn = crypto.createHash('md5');
        hashFn.update(str);
        return hashFn.digest('hex'); // to 32bit hex string
    }

    var result = req.map(function(r) {
        var key = hash(r.sign);
        if (key in this.cache)
            return true;

        if (r.update !== false)
            this.cache[key] = null;

        return false;
    }, this);

    if (callback) {
        callback(null, result);
    }

    return result.length === 1 ? result[0] : result;
}

MemRepo.prototype.dispose = function() {

}

module.exports = MemRepo;