hasProp = {}.hasOwnProperty;

var Cluster = function(maxConcurrent, rateLimit, priorityRange, defaultPriority, homogeneous) {
    this.maxConcurrent = maxConcurrent;
    this.rateLimit = rateLimit;
    this.priorityRange = priorityRange;
    this.defaultPrioty = defaultPriority;
    this.homogeneous = homogeneous ? true : false;
    this.limiters = {};
    this.Bottleneck = require("./Bottleneck");
}

Cluster.prototype.key = function(key) {
    var ref;
    if (key == null) {
        key = "";
    }
    if((ref = this.limiters[key]) == null)  {
	ref = this.limiters[key] = new this.Bottleneck(this.maxConcurrent, this.rateLimit, this.priorityRange, this.defaultPriority, this.homogeneous ? this : null);
	ref.setName(key);
    }
    return ref;
};

Cluster.prototype.deleteKey = function(key) {
    if (key == null) {
        key = "";
    }
    return delete this.limiters[key];
};

Cluster.prototype.all = function(cb) {
    var k, ref, results, v;
    ref = this.limiters;
    results = [];
    for (k in ref) {
        if (!hasProp.call(ref, k)) continue;
        v = ref[k];
        results.push(cb(v));
    }
    return results;
};

Cluster.prototype.keys = function() {
    return Object.keys(this.limiters);
};

Cluster.prototype._waitingClients = function() {
    var count = 0;
    var keys = this.keys();
    keys.forEach(function(key) {
	count += this.limiters[key]._waitingClients.size();
    }, this);
    return count;
};

Cluster.prototype._unfinishedClients = function() {
    var count = 0;
    var keys = this.keys();
    keys.forEach(function(key) {
	count += this.limiters[key]._waitingClients.size();
	count += this.limiters[key]._tasksRunning;
    }, this);
    return count;
};

Cluster.prototype.dequeue = function(name) {
    var keys = this.keys();
    for(var i = 0; i < keys.length; ++i) {
	if(this.limiters[keys[i]]._waitingClients.size()) {
	    return {
		next: this.limiters[keys[i]]._waitingClients.dequeue(),
		limiter: name
	    };
	}
    }
}

Cluster.prototype._status = function() {
    var status = [];
    var keys = this.keys();
    keys.forEach(function(key) {
	status.push([
	    'key: '+key,
	    'running: '+this.limiters[key]._tasksRunning,
	    'waiting: '+this.limiters[key]._waitingClients.size()
	].join());
    }, this);
    return status.join(';');
}

Cluster.prototype.startAutoCleanup = function() {
    var base;
    this.stopAutoCleanup();
    return typeof (base = (this.interval = setInterval((function(_this) {
        return function() {
            var k, ref, results, time, v;
            time = Date.now();
            ref = _this.limiters;
            results = [];
            for (k in ref) {
                v = ref[k];
                if ((v._nextRequest + (1000 * 60 * 5)) < time) {
                  results.push(_this.deleteKey(k));
                } else {
                  results.push(void 0);
                }
            }
            return results;
        };
    })(this), 1000 * 30))).unref === "function" ? base.unref() : void 0;
};

Cluster.prototype.stopAutoCleanup = function() {
    return clearInterval(this.interval);
};

Object.defineProperty(Cluster.prototype, 'waitingClients', {
    get:function() {
	return this._waitingClients()
    }
})

Object.defineProperty(Cluster.prototype, 'unfinishedClients', {
    get:function() {
	return this._unfinishedClients()
    }
})

Object.defineProperty(Cluster.prototype, 'status', {
    get:function() {
	return this._status()
    }
})

Object.defineProperty(Cluster.prototype, 'empty', {
    get:function() {
	return this._unfinishedClients() > 0 ? false : true
    }
})

module.exports = Cluster;
