var PriorityQueue = function(size) {
    var me = {}, slots, i, total = null;

    // initialize arrays to hold queue elements
    size = Math.max(+size | 0, 1);
    slots = [];
    for (i = 0; i < size; i += 1) {
        slots.push([]);
    }

    //  Public methods
    me.size = function () {
        var i;
        if (total === null) {
            total = 0;
            for (i = 0; i < size; i += 1) {
                total += slots[i].length;
            }
        }
        return total;
    };

    me.enqueue = function (obj, priority) {
        var priorityOrig;

        // Convert to integer with a default value of 0.
        priority = priority && + priority | 0 || 0;

        // Clear cache for total.
        total = null;
        if (priority) {
            priorityOrig = priority;
            if (priority < 0 || priority >= size) {
                priority = (size - 1);
                // put obj at the end of the line
                console.error("invalid priority: " + priorityOrig + " must be between 0 and " + priority);
            }
        }

        slots[priority].push(obj);
    };

    me.dequeue = function (callback) {
        var obj = null, i, sl = slots.length;

        // Clear cache for total.
        total = null;
        for (i = 0; i < sl; i += 1) {
            if (slots[i].length) {
                obj = slots[i].shift();
                break;
            }
        }
        return obj;
    };

    return me;
};

function Bottleneck(maxConcurrent, rateLimit, priorityRange, defaultPriority, cluster) {
    if(isNaN(maxConcurrent) || isNaN(rateLimit)) {
        throw "maxConcurrent and rateLimit must be numbers";
    }

    priorityRange = priorityRange || 1;
    if(isNaN(priorityRange)) {
        throw "priorityRange must be a number";
    }
    priorityRange = parseInt(priorityRange);
    defaultPriority = defaultPriority ? defaultPriority : Math.floor(priorityRange/2);
    if(isNaN(defaultPriority)) {
        throw "defaultPriority must be a number";
    }
    defaultPriority = defaultPriority >= priorityRange ? priorityRange-1 : defaultPriority;
    defaultPriority = parseInt(defaultPriority);

    this.cluster = cluster;
    this.rateLimit = parseInt(rateLimit);
    this.maxConcurrent = this.rateLimit ? 1 : parseInt(maxConcurrent);
    this._waitingClients = new PriorityQueue(priorityRange);
    this._priorityRange = priorityRange;
    this._defaultPriority = defaultPriority;
    this._nextRequest = Date.now();
    this._tasksRunning = 0;
}

Bottleneck.prototype.setName = function(name) {
    this.name = name;
}

Bottleneck.prototype.setRateLimit = function(rateLimit) {
    if(isNaN(rateLimit)) {
	throw "rateLimit must be a number";
    }
    this.rateLimit = parseInt(rateLimit);
    if(this.rateLimit > 0) {
	this.maxConcurrent = 1;
    }
}

Bottleneck.prototype.submit = function(options, clientCallback) {
    var self = this;
    var priority = null;
    if(typeof options == "number") {
        priority = parseInt(options);
    } else {
        priority = options.priority;
    }
    priority = Number.isInteger(priority) ? priority: self._defaultPriority;
    priority = priority > self._priorityRange-1 ? self._priorityRange-1 : priority;
    this._waitingClients.enqueue(clientCallback, priority);
    self._tryToRun();
    return;
}

Bottleneck.prototype._tryToRun = function() {
    var self = this;
    if(self._tasksRunning < self.maxConcurrent && self.hasWaitingClients()) {
        ++self._tasksRunning;
        var wait = Math.max(self._nextRequest - Date.now(), 0);
        self._nextRequest = Date.now() + wait + self.rateLimit;
        var obj = self.dequeue();
	var next = obj.next;
	var limiter = obj.limiter;
        setTimeout(function(){
            var done = function() {
                --self._tasksRunning;
                self._tryToRun();
            }
            next(done, limiter);
        }, wait);
    }
    return;
}

Bottleneck.prototype.hasWaitingClients = function() {
    if(this._waitingClients.size()) {
	return true;
    }
    if(this.cluster && this.cluster._waitingClients()) {
	return true;
    }
    return false;
}

Bottleneck.prototype.dequeue = function() {
    if(this._waitingClients.size()) {
	return {
	    next: this._waitingClients.dequeue(),
	    limiter: null
	};
    }
    return this.cluster.dequeue(this.name);
}

Bottleneck.Cluster = Bottleneck.prototype.Cluster = require("./Cluster");

module.exports = Bottleneck;
