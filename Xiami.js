
const https       = require("https");
const querystring = require('querystring');
const superagent  = require("superagent");
const cheerio     = require("cheerio");
// login refernce from https://www.jianshu.com/p/87867f325184

var browserMsg={
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
    'Content-Type':'application/x-www-form-urlencoded'
};

//访问登录接口获取cookie
function getLoginCookie(userid, pwd) {
    userid = userid.toUpperCase();
    return new Promise(function(resolve, reject) {
        superagent.post('https://login.xiami.com/member/login').set(browserMsg).send({
            userid: userid,
            pwd: pwd,
            timezoneOffset: '0'
        }).redirects(0).end(function (err, response) {
            //获取cookie
            var cookie = response.headers["set-cookie"];
            resolve(cookie);
        });
    });
}

function getData(cookie,callback) {
        superagent.get("http://www.xiami.com/space/lib-song/")
        .set("Cookie",cookie)
        .set(browserMsg)
        .end(function(err,res) {
        var content = cheerio.load(res.text);
        callback(content);
        })
}

// function dealdata(content){
//     return new Promise((resolve,reject) => {
//         console.log(content);
//     })
// }

getLoginCookie("apple19950105@gmail.com","apple19950105")
.then((res) =>{
    console.log(res);
    getData(res,($) => {
        console.log($.html());
    })
})