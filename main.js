const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const Spotify = require("./Spotifynew");
const Xiami = require("./Xiami");
const app = express();



app.get("/login", (req, res) => {
    /**
     * @param  {} nothing
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
        callback(res,error, response, body)
    });
    })


async function callback(res,error, response, body) {
    var access_token  = body.access_token,
        refresh_token = body.refresh_token;
    
    var username      = await Spotify.get_user_id(              access_token);
    var _             = await Spotify.create_playlist(username, access_token);
    var playlist_id   = await Spotify.get_playlist_id(username, access_token);
    var arr = await Xiami.get_user_playlist("apple19950105@gmail.com", "apple19950105");
    console.log("!!!!!");
    console.log(arr);
    
    arr = await Spotify.get_songs_uri(arr,access_token);
    res.write(JSON.stringify(arr.passed));
    // Spotify.add(username,playlist_id,arr.passed,access_token);
    // res.write(JSON.stringify({
    //     access_token,
    //     "success" : arr.passed,
    //     "fail" : arr.fail
    // }));
    // var passed = arr.success,
    //     fail    = arr.fail;
    // console.log(passed);

}

app.listen(8888);