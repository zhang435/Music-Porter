const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const hbs = require("hbs");
const app = express();
const port = process.env.PORT || 8888;

const Spotify = require("./Spotify");
const Xiami = require("./Xiami");
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
    const xiami_username = req.body.username;
    const xiami_password = req.body.password;
    const spotify_access_token = req.body.spotify_access_token;

    callback(xiami_username, xiami_password, spotify_access_token, res);
})


async function callback(xiami_username, xiami_password, access_token, res) {
    // check if xiami user been successfully login, return some useful error message if not
    var xiami_data = await Xiami.login(xiami_username, xiami_password).catch(error => error);
    // res.write(JSON.stringify(xiami_data));
    if ("error" in xiami_data)
        res.send(xiami_data.error);
    
    
    var username = await Spotify.get_user_id(access_token).catch(error => console.log(error));
    var _ = await Spotify.create_playlist(username, access_token).catch(error => console.log(error));
    var total_page = await Xiami.total_page(xiami_data).catch(error => console.log(error));
    var playlist_id = await Spotify.get_playlist_id(username, access_token).catch(error => console.log(error));
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    for (var i = 1; i <= total_page; i++) {
        var song_aritsts = await Xiami.fetch_page(xiami_data, i);
        song_aritsts = await Spotify.get_songs_uri(song_aritsts, access_token);
        res.write(JSON.stringify(song_aritsts));
        await Spotify.add(username, playlist_id, song_aritsts.passed, access_token);
    }

}

app.listen(port);