
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
const Spotify   = require("./Spotify");
const app = express();

app.get("/login",(req,res) => {
    /**
     * @param  {} nothing
     * @return {promise} 
     */
     var url = 'https://accounts.spotify.com/authorize?';

    var QUERY_PARAMETER = {
        client_id : Spotify.CLIENT_ID,
        response_type : "code",
        redirect_uri : Spotify.REDIRECT_URI,
        scope : Spotify.SCOPE
      }
    res.redirect(url + querystring.stringify(QUERY_PARAMETER))
})


app.get("/callback",(req,res) => {
    var code = req.query.code  || null;
    var state= req.query.state || null;

    if(code == null)
        res.send("something goes wrong during stage 2-3");
    
    // requests_refresh_and_access_tokens
    REQUEST_BODY_PARAMETER = {
        url :'https://accounts.spotify.com/api/token',
        form : {
            grant_type  :"authorization_code",
            code        : code,
            redirect_uri: Spotify.REDIRECT_URI
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(Spotify.CLIENT_ID + ':' + Spotify.CLIENT_SECRET).toString('base64'))
        },
        json:true
    }

    request.post(REQUEST_BODY_PARAMETER, (error, response, body) =>{
        // in our case, I do not think by any chane we will use refresh_token simply casue there is not that many data to process
        var access_token  = body.access_token,
            refresh_token = body.refresh_token;
        // res.send(access_token);
        // Spotify.get_song_info("friends",'Justin Bieber',access_token);
        // Spotify.create_playlist("zhang435",access_token)
        // Spotify.create_playlist();
        
         Spotify.add(access_token)
         res.send(access_token)
        // add_song_into_spotify(access_token,refresh_token)

    })
    
})

app.listen(8888);