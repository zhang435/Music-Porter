const https      = require("https");
const http       = require("http");
const superagent = require("superagent");
const cheerio    = require("cheerio");
var querystring  = require("querystring");
var browserMsg={
    "User-Agent"  :"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    'Content-Type':'application/x-www-form-urlencoded',
    "referer"     :'https://login.xiami.com/member/login'
};

var log_in_url   = "https://login.xiami.com/member/login";
var playlist_url =  "http://www.xiami.com/space/lib-song/page/1";



superagent.get('https://login.xiami.com/member/login')
.then((res) => {
    const xiamiToken = res.headers['set-cookie'][1].match(/_xiamitoken=(\w+);/)[1]

    const postData = {
        '_xiamitoken': xiamiToken,
        'account': "apple19950105@gmail.com",
        'pw': "apple19950105"
    }

    const options = {
        hostname: 'login.xiami.com',
        path: '/passport/login',
        method: 'POST',
        headers: {
            'Referer': 'https://login.xiami.com/member/login',
            'Cookie': `_xiamitoken=${xiamiToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    
})