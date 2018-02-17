var assert = require("assert")
var seenreq = require("../lib/seenreq.js")
var seen = new seenreq({
    normalizer: 'toobject',
    repo: "redis",
    host: "192.168.98.116",
    port: 6379,
});

seen.exists("http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-1.html", {
    callback: function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result[0]);
            assert.equal(false, result[0]);
        }

        seen.exists("http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-1.html", {
            callback: function(err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result[0]);
                    assert.equal(true, result[0]);
                }
            }
        })
    }
})

var opt = {
    uri: "http://baoming.xdf.cn/ShoppingCart/Handlers/getCartVoucherHandler.ashx",
    method: 'POST',
    form: {
        s: "a"
    },
    headers: {
        Cookie: "Xdf.WebPay.V4.Cart=" + ""
    },
    jQuery: false
}

var opt2 = {
    uri: "http://baoming.xdf.cn/ShoppingCart/Handlers/getCartVoucherHandler.ashx",
    method: 'POST',
    form: {
        s: "b"
    },
    headers: {
        Cookie: "Xdf.WebPay.V4.Cart=" + ""
    },
    jQuery: false
}

seen.exists(opt, {
    callback: function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            assert.equal(false, result[0]);
        }


        seen.exists(opt2, {
            callback: function(err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result);
                    assert.equal(false, result[0]);
                }
            }
        });
    }
});

seen.exists([
        {uri: 'http://www.google.com/', seenreq_update: false}
    ], {
        callback: function(err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
                assert.equal(false, result[0]);

                seen.exists([
                    {uri: 'http://www.google.com/', seenreq_update: true}
                ], {
                    callback: function(err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(result);
                            assert.equal(false, result[0]);

                            seen.exists([
                                {uri: 'http://www.google.com/', seenreq_update: false}
                            ], {
                                callback: function(err, result) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(result);
                                        assert.equal(true, result[0]);
                                    }
                                    finalTest();
                                }
                            })
                        }
                    }
                })
            }
        }
    })

function finalTest() {
    seen.exists(['http://www.twitter.com', 'http://www.google.com.hk', 'http://www.twitter.com'], {
        callback: function(err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
                assert.equal(false, result[0]);
                assert.equal(false, result[1]);
                assert.equal(true, result[2]);
            }
            setTimeout(seen.dispose.bind(seen), 1000);
        }
    })
}
