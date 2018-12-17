const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const hbs = require("hbs");
const app = express();
const port = process.env.PORT || 8888;

const Spotify = require("./Spotify");
const Xiami = require("./Xiami");
const Netease = require("./NetEaseCloudMusic");
// const account = require("./account")


var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////  

app.get("/", (req, res) => {
    /**
     * @param  {} when user first get into the page, go thorugh the auth process
     * @return {promise} 
     */
    var url = 'https://accounts.spotify.com/authorize?';

    var QUERY_PARAMETER = {
        client_id: Spotify.CLIENT_ID,
        response_type: "code",
        redirect_uri: Spotify.REDIRECT_URI,
        scope: Spotify.SCOPE
    }
    res.redirect(url + querystring.stringify(QUERY_PARAMETER))
})

app.get("/callback", (req, res) => {
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (code == null)
        res.send("something goes wrong during stage 2-3");

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
        res.render("index.hbs", {
            access_token: body.access_token
        })
    });
})

app.post("/xiami", (req, res) => {
    const playlist_url = req.body.playlist_url;
    const spotify_access_token = req.body.spotifyAccessToken;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    xiamiprocess(playlist_url, spotify_access_token, res);
})


app.post("/netEaseCloudMusic", (req, res) => {
    const spotify_access_token = req.body.spotify_access_token;
    const netEaseCloudMuiscUrl = req.body.playlistUrl;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    neteaseprocess(spotify_access_token, netEaseCloudMuiscUrl, res);
})



async function xiamiprocess(ls_url, spotify_access_token, res) {
    var _xiami_access_token = await Xiami.fetch_xiami_token().catch("error during access _xiami_access_token");
    if ("error" in _xiami_access_token) {
        res.send(_xiami_access_token);
        return;
    }
    var sp = Spotify.Spotify();

    for (var i = 1; i <= total_page; i++) {
        var song_aritsts = await Xiami.fetch_page(xiami_data, i);
        song_aritsts = await Spotify.get_songs_uri(song_aritsts, spotify_access_token);
        res.write(JSON.stringify(song_aritsts));
        await Spotify.add(sp.username, sp.playlist_id, song_aritsts.passed, spotify_access_token);
    }
    res.end("<h1> done,check 'tmp' in Spotify</h1>");
}

async function neteaseprocess(spotify_access_token, netEaseCloudMuiscUrl, res) {
    var username = await Spotify.get_user_id(spotify_access_token).catch(error => console.log(error));
    var _ = await Spotify.create_playlist(username, spotify_access_token).catch(error => console.log(error));
    var song_aritsts = await Netease.generate_song_singer(netEaseCloudMuiscUrl, res).catch(err => console.log(err));
    var playlist_id = await Spotify.get_playlist_id(username, spotify_access_token).catch(error => console.log(error));

    // split search from whole to part, so that usre can track the process
    var chunk = 5;
    for (var i = 0; i < song_aritsts.length; i += chunk) {
        var part = song_aritsts.slice(i, i + chunk);
        part = await Spotify.get_songs_uri(part, spotify_access_token);
        res.write(JSON.stringify(part));
        await Spotify.add(username, playlist_id, part.passed, spotify_access_token).catch(error => console.log(error));
    }


    res.end("<h1> done,check 'tmp' in Spotify</h1>");
}

app.listen(port);