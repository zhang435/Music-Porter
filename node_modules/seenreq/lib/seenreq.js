'use strict'

function seenreq(options) {
    var Repo = require("./repo/repo_" + ((options && options.repo) || "default") + ".js");
    this.repo = new Repo(options);
    var Normalizer = require("./normalizer/normalizer_" + ((options && options.normalizer) || "default") + ".js");
    this.normalizer = new Normalizer(options);
}

seenreq.prototype.normalize = function(req, options) {
    return this.normalizer.normalize(req, options);
}

seenreq.prototype.exists = function(req, options) {
    if (!(req instanceof Array)) {
        req = [req];
    }
    var self = this,
        cb = null;

    if (typeof options === 'function') {
        cb = options;
        options = null;
    } else if (typeof options === 'object') {
        cb = options.callback;
        delete options.callback;
    }

    var rs = req.map(function(r) {
        var rtn = null;
        var opt = self.normalize(r, options);
        if (typeof opt === 'string') {
            rtn = {sign: opt, update: true};
        } else if (opt instanceof Array) {
            rtn = opt.map(function(r) {
                return typeof r === 'string' ? {sign: r, update: true} : r;
            });
        } else if (typeof opt === 'object') {
            rtn = opt;
        } else {
            throw new Error('illegal arguments');
        }
        return rtn;
    });
    return this.repo.exists(rs, cb);
}

seenreq.prototype.dispose = function() {
    this.repo.dispose();
}

module.exports = seenreq