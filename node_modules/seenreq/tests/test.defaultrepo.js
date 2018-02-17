var assert = require("assert")
var seenreq = require("../lib/seenreq.js")
var seen = new seenreq();

assert.equal(false, seen.exists("http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-1.html"));
assert.equal(true, seen.exists("http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-1.html"));

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

assert.equal(false, seen.exists(opt));
assert.equal(false, seen.exists(opt2));

seen = new seenreq({normalizer: 'toobject'});

opt = {
    uri: "http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-2.html",
    seenreq_update: false
}

opt2 = "http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-2.html";

var opt3 = {
    uri: "http://mall.autohome.com.cn/list/0-110100-0-0-0-0-0-0-0-2.html",
    seenreq_update: false
}

assert.equal(false, seen.exists(opt));
assert.equal(false, seen.exists(opt2));
assert.equal(true, seen.exists(opt3));
