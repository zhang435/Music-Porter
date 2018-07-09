
const Netease = require("./NeteaseCloudMusicApi/util/util");
const http = require("http")
const https = require("https")
const querystring = require("querystring")
const cheerio = require("cheerio")
const suepragent = require("superagent")


const testlink1 = "https://music.163.com/playlist?id=501341874";
const testlink2 = "https://music.163.com/playlist?id=11879687";
const URL = "https://music.163.com"
function login(username, password) {
    /**
     * "netease does not need login to get playlist";
     */
    
}


function fetch_page(link) {
    return new Promise((resolve,reject) => {
        suepragent
        .get(link)
        .end((err,res) => {
            if (err)
                reject({err});
            $ = cheerio.load(res.text);
            // console.log($.html());
            // console.log($(".n-songtb").find("li"));
            // console.log($('.f-hide').html());
            resolve($('.f-hide').html());
            
            
    
            
        });
    })
}

async function get_song_profile() {
    var content = await fetch_page(testlink1).catch(error => error);
    return new Promise((resolve,rej) => {
        
        var profiles = Array();
        $  = cheerio.load(content);
        $("a").each(( index, element) => {
            profiles.push($(element).attr("href"));
        })
        resolve(profiles);
        rej("_");
    })
    
}

 async function fetch_song_singer() {
    var profiles = await get_song_profile().catch(error => error);

    
}

fetch_song_singer().catch(error => error);