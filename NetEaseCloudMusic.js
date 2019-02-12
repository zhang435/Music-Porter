const cheerio = require("cheerio")
const suepragent = require("superagent")

const NETEASEMUSICURL = "https://music.163.com"
const testconst = require("./test");

module.exports = {
    generateSongSingers
}


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
 * in neteaseCloudMusic, there is a profile url for each individual song, the playlist site will 
 * contains the url for each song, where I use the profile to get track & singer data
 * TODO: the reason I choice this way is that, even though we get the playlist page, we 
 * can not get the singer content for some reason, the html content does not include the
 * singer but only the song name, one thing I noticed is that it has loading words in the
 * html content, which means when the page load, it has partial content that is
 * not fully loaded from the back end, so it is the reason why it's not showing the full content
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
 * @param {*} link to thr playlist
 */
async function generateSongSingers(link, sp, res) {
    link = link.replace("/#/", "/");
    var profiles = await get_song_profile(link).catch(error => console.log(error));
    var songArtists = new Array();
    // res.write("<h1>Fetching songs from NetEaseMusic: " + link + " : </h1>" + "\n");
    for (var i = 0; i < profiles.length; i++) {
        var song_singer = await getSongSingerFromProfilePage(profiles[i]).catch(err => console.log(err));
        console.log(song_singer);
        songArtists.push(song_singer);
        if (songArtists.length == 50 || (i == profiles.length - 1)) {
            var uris = await sp.getSongsURI(songArtists).catch(err => err);
            if (uris.success) {
                res.write(JSON.stringify(uris) + "<br>");
            } else {
                res.write(uris.message);
                return;
            }

            sp.addSongsToPlaylist(uris.val.uris).then((result) => {
                // res.write(JSON.stringify(result) + "\n");
            }).catch((err) => {
                res.write(JSON.stringify(err.message));
                return;
            });
            songArtists = new Array();
        }
    }

    // res.write("<h1>search fetched songs in Spotify</h1>");

    return new Promise((resolve, rej) => {
        resolve({
            success: true,
            val: null
        });
        rej("can not get song singers")
    })


}


// generateSongSingers();
// var netEaselink1 = "https://music.163.com/playlist?id=501341874";
// var netEaselink2 = "https://music.163.com/playlist?id=11879687";
// var netEaselink3 = "https://music.163.com/#/playlist?id=2542915771";
// // console.debug(testconst)
// (async () => {
//     var songArtists = await generateSongSingers(netEaselink1, null).catch(err => console.log(err));
//     console.log(songArtists);
// })()