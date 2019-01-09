const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const hbs = require("hbs");
const app = express();
const port = process.env.PORT || 8888;

const Spotify = require("./Spotify");
const Xiami = require("./Xiami");
const NetEase = require("./NetEaseCloudMusic");
// const account = require("./account")


var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

const authorizeUrl = 'https://accounts.spotify.com/authorize?';

////////////////////////////////////////////////////////////////////////////////////////////////////////////  
/**
 * request the access token for spotify
 */
app.get("/", (req, res) => {
    /**
     * @param  {} when user first get into the page, go thorugh the auth process
     * @return {promise} 
     */

    var QUERY_PARAMETER = {
        client_id: Spotify.CLIENT_ID,
        response_type: "code",
        redirect_uri: Spotify.REDIRECT_URI,
        scope: Spotify.SCOPE
    }
    res.redirect(authorizeUrl + querystring.stringify(QUERY_PARAMETER))
})

/**
 * redirect back to the homepage with access token
 */
app.get("/callback", (req, res) => {
    var code = req.query.code || null;

    if (code == null)
        res.end("Missing code from Spotify redirect");

    // requests_refresh_and_access_tokens
    REQUEST_BODY_PARAMETER = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: Spotify.REDIRECT_URI
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(Spotify.CLIENT_ID + ':' + Spotify.CLIENT_SECRET).toString('base64'))
        },
        json: true
    }



    request.post(REQUEST_BODY_PARAMETER, (error, response, body) => {
        console.log(body);
        res.render("index.hbs", {
            accessToken: body.access_token
        })
    });
})

// handler for Xiami
app.post("/xiami", (req, res) => {
    var playlistUrl = req.body.playlistUrl;
    var spotifyAccessToken = req.body.spotifyAccessToken;
    if ([playlistUrl, spotifyAccessToken].includes(undefined)) {
        res.end("giving undefined value when rendering Xiami", JSON.stringify([playlistUrl, spotifyAccessToken]));
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    xiamiProcess(playlistUrl, spotifyAccessToken, res);
})

// handler for NetEaseMusic
app.post("/NetEaseCloudMusic", (req, res) => {
    var spotifyAccessToken = req.body.spotifyAccessToken;
    const NetEaseCloudMusicUrl = req.body.playlistUrl;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    NetEaseProcess(spotifyAccessToken, NetEaseCloudMusicUrl, res);
})



async function xiamiProcess(url, spotifyAccessToken, res) {
    var xm = await Xiami.init(url).catch(err => err);
    var sp = await Spotify.init(spotifyAccessToken, "Xiami ").catch(err => err);

    if (!xm.success || !sp.success) {
        res.end(JSON.stringify({
            "xiami": xm.message,
            "spotify": sp.message
        }));
    } else {
        xm = xm.val;
        sp = sp.val;
    }

    for (var i = 1;; i++) {

        var page = await xm.fetchPage(i).catch(err => err);
        if (!page.success) {
            res.end(page.message);
        } else {
            page = page.val;
        }
        console.debug("page", i);
        // console.debug(page);

        var xmSongSingers = await xm.generateSongSinger(page).catch(err => err);
        if (!xmSongSingers.success) {
            res.end(xmSongSingers.message);
        } else {
            xmSongSingers = xmSongSingers.val;
        }

        // // console.debug(xmSongSingers, "!!!!!!");
        if (xmSongSingers.length == 0) {
            break;
        }

        // console.debug(xmSongSingers);
        var uris = await sp.getSongsURI(xmSongSingers);
        if (uris.success) {
            res.write(JSON.stringify(uris));
        } else {
            res.end(uris.message);
        }


        console.debug("reaching the end of page", i);
        sp.addSongsToPlaylist(uris.val.uris).then((result) => {
            res.write(JSON.stringify(result));
        }).catch((err) => {
            res.end(JSON.stringify(err.message));

        });

    };
    res.end("<h1> Finished </h1>");
}

async function NetEaseProcess(spotifyAccessToken, NetEaseCloudMusicUrl, res) {

    var sp = await Spotify.init(spotifyAccessToken, "NetEase ").catch(err => err);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (!sp.success) {
        res.end(JSON.stringify({
            "spotify": sp.message
        }));
    } else {
        sp = sp.val;
    }

    var songArtists = await NetEase.generateSongSingers(NetEaseCloudMusicUrl, res).catch(err => console.log(err));

    // split search from whole to part, so that user can track the process
    var chunk = 10;
    for (var i = 0; i < songArtists.length; i += chunk) {
        var part = songArtists.slice(i, i + chunk);

        var uris = await sp.getSongsURI(part).catch(err => err);
        if (uris.success) {
            res.write(JSON.stringify(uris));
        } else {
            res.end(uris.message);
            return;
        }

        sp.addSongsToPlaylist(uris.val.uris).then((result) => {
            res.write(JSON.stringify(result));
        }).catch((err) => {
            res.end(JSON.stringify(err.message));
            return;
        });
        // await Spotify.add(username, playlist_id, part.passed, spotify_access_token).catch(error => console.log(error));
    }
    res.end("<h1> done,check 'from NetEase' in Spotify</h1>");
}

app.listen(port);