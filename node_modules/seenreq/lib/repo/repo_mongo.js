var crypto = require('crypto')
var base = require("./repo.js")
var MongoClient = require('mongodb').MongoClient

function MongoRepo(options) {
    var self = this;
    var mongoUrl = options.mongo || "mongodb://192.168.98.116:27017/seenreq";
    this.collectionName = options.collection || "foo";
    this.clearOnQuit = options.clearOnQuit !== false;
    this.connecting = true;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        db.collection(self.collectionName).createIndex({key: 1}, {unique: true});
        self.db = db;
        self.connecting = false;
    });
}

MongoRepo.prototype = Object.create(base.prototype);
MongoRepo.prototype.constructor = MongoRepo;

/*
    @param opt(array of object) 
        {
            sign: "GET http://www.baidu.com/\r\n",
            update: true
        }
    @return rst(array of boolean), each element denotes the existence of corresponding object in opt
 */
MongoRepo.prototype.exists = function(opt, callback) {
    var self = this;
    if (self.connecting) {
        return setTimeout(function() {
            self.exists(opt, callback);
        }, 1000);
    }

    var req = opt,
        slots = {},
        uniq = [],
        keysToInsert = {};

    var hash = function(str) {
        var hashFn = crypto.createHash('md5');
        hashFn.update(str);
        return hashFn.digest('hex'); // to 32bit hex string
    }

    var rst = new Array(req.length);

    for (var i = 0; i < req.length; i++) {
        var key = hash(req[i].sign);
        if (key in slots) {
            rst[i] = true; // set exists=true for duplicates
        } else {
            rst[i] = false;
            slots[key] = i;
            if (req[i].update === true) {
                keysToInsert[key] = null;
            }
            uniq.push(key);
        }
    }

    self.db.collection(self.collectionName).find({
        key: {
            $in: uniq
        }
    }).toArray(function(err, r) {
        if (err) {
            return callback(err);
        }
        r.forEach(function(doc) {
            rst[slots[doc.key]] = true;
            delete keysToInsert[doc.key];
        });

        keysToInsert = Object.keys(keysToInsert).map(key => {return {key: key}});

        if (keysToInsert.length === 0) {
            return callback(null, rst);
        }

        self.db.collection(self.collectionName).insertMany(keysToInsert, {ordered : false}, function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, rst);
        });
    });
}

MongoRepo.prototype.dispose = function() {
    var self = this;
    if (self.clearOnQuit) {
        self.db.dropCollection(self.collectionName, function(err) {
            if (err)
                throw err;
            self.db.close();
        });
    } else {
        self.db.close();
    }
}

module.exports = MongoRepo;
