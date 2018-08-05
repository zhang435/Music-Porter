const cheerio = require("cheerio")
const suepragent = require("superagent")

const NETEASEMUSICURL = "https://music.163.com"
const testconst = require("./test");

module.exports = {
    generate_song_singer
}


var netEaselink1 = "https://music.163.com/playlist?id=501341874";
var netEaselink2 = "https://music.163.com/playlist?id=11879687";

/**
 * use playlist url to get the 
 * @param {String} link the playlist link, it will fetch table html content to get_song_profile
 */
function fetch_page(link) {
    return new Promise((resolve, reject) => {
        suepragent
            .get(link)
            .end((err, res) => {
                if (err)
                    reject({

                        err
                    });

                $ = cheerio.load(res.text);
                resolve($('.f-hide').html());
            });
    })
}

/**
 * in neteaseCloudMusic, there is a profile url for each indivudal song, the playlist site will 
 * contains the url for each song, where I use the profile to get track & singetr data
 * TODO: the reason I choice this way is that, even though we get the palylist page, we 
 * can not get the singer content for some reason, the html content does not include the
 * singer but only the song name, one thing I noticed is taht it has loading words in the
 * html content, which means when the page load, it has partial content that is
 * not fully loaded from the backend, so it is the reason why it's not showing the full content
 * let me know if you actually know the solution time fix this problem
 * I have limit of time to spend on this project at this point, a PR is better
 * @param {string} link link to the profile page
 */
async function get_song_profile(link) {
    console.log("this is the url", link);
    var content = await fetch_page(link).catch(error => error);
    return new Promise((resolve, rej) => {

        var profiles = Array();
        $ = cheerio.load(content);
        $("a").each((index, element) => {
            profiles.push($(element).attr("href"));
        })
        resolve(profiles);
        rej("_");
    })
}


/**
 * get song singer for one song
 * @param {*} link 
 */

async function getSongSingerFromProfilePage(link) {
    return new Promise((resolve, reject) => {
        suepragent
            .get(NETEASEMUSICURL + link)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                $ = cheerio.load(res.text);
                var song = $("em.f-ff2").text();
                var singer = $("span").children(".s-fc7").text();
                resolve(new Array(song, singer));
            })
    })
}

/**
 * get song singer for each song
 * this should be the only entrance for the netEaseMusic
 * @param {*} link to thr palylist
 */
async function generate_song_singer(link, res) {
    link = link.replace("/#/", "/");
    var profiles = await get_song_profile(link).catch(error => console.log(error));
    var song_aritsts = new Array();
    res.write("<h1>Fetching songs from NetEaseMusic: " + link + " : </h1>" + "\n");
    for (var i = 0; i < profiles.length; i++) {
        var song_singer = await getSongSingerFromProfilePage(profiles[i]).catch(err => console.log(err));
        console.log(song_singer);
        res.write((i + 1) + ", " + song_singer.toString() + "</br>");
        song_aritsts.push(song_singer);
    }

    res.write("<h1>search fetched songs in Spotify</h1>");

    return new Promise((resolve, rej) => {
        resolve(song_aritsts);
        rej("can not get song singerls")
    })


}


// generate_song_singer()
// fetch_page(testconst.netEaselink1).catch(err => console.log(err));s