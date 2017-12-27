var assert = require("assert")
var seenreq = require("../lib/seenreq.js")
var seen = new seenreq({
    normalizer: 'toobject',
    repo: "mongo",
    host: "192.168.98.116",
    clearOnQuit: true,
});

function step1(nextStep) {
    seen.exists('http://www.url1.com/', function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(false, result[0]);
        nextStep(null);
    });
}

function step2(nextStep) {
    seen.exists('http://www.url1.com/', function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(true, result[0]);
        nextStep(null);
    });
}

function step3(nextStep) {
    seen.exists({uri: 'http://www.url2.com/', seenreq_update: false}, function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(false, result[0]);
        nextStep(null);
    });
}

function step4(nextStep) {
    seen.exists({uri: 'http://www.url2.com/', seenreq_update: true}, function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(false, result[0]);
        nextStep(null);
    });
}

function step5(nextStep) {
    seen.exists({uri: 'http://www.url2.com/', seenreq_update: true}, function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(true, result[0]);
        nextStep(null);
    });
}

function step6(nextStep) {
    seen.exists(['http://www.url3.com/','http://www.url3.com/','http://www.url4.com/','http://www.url5.com/'], function(err, result) {
        if(err) {
            throw err;
        }
        assert.equal(false, result[0]);
        assert.equal(true, result[1]);
        assert.equal(false, result[2]);
        assert.equal(false, result[3]);
        seen.dispose();
        nextStep(null);
    });
}

runInOrder([step1,step2,step3,step4,step5,step6]);

function runInOrder(fnlist) {
    if (!Array.isArray(fnlist)) {
        throw new Error('fnlist should be array of function');
    }
    i = 0;
    run(i);
    function next(err, name) {
        if (err) {
            console.log(err);
        }
        console.log('%s done', name);
        i++;
        run(i);
    }
    function run(index) {
        if (index == fnlist.length) {
            console.log('all done');
            return;
        }
        var fn = fnlist[index];
        if (typeof fn !== 'function') {
            throw new Error('all element of fnlist should be function');
        }
        var name = fn.name;
        var wrappedNext = function(err) {
            next(err, name);
        }
        fn(wrappedNext);
    }
}