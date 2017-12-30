var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
const spotify   = require("./Spotify");
const app = express();

app.get("/login",(req,res) => {
    /**
     * @param  {} nothing
     * @return {promise} 
     */

     var url = 'https://accounts.spotify.com/authorize?';

    var QUERY_PARAMETER = {
        client_id : spotify.CLIENT_ID,
        response_type : "code",
        redirect_uri : spotify.REDIRECT_URI,
        scope : spotify.SCOPE
      }

    res.redirect(url + querystring.stringify(QUERY_PARAMETER))
})


app.get("/callback",(req,res) => {
    res.send("well come back");
})
app.listen(8888);