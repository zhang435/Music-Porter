// referene from https://developer.spotify.com/web-api/authorization-guide/
// this is build base on the instruction , the flow of 
var express     = require('express'); // Express web server framework
var request     = require('request'); // "Request" library
var querystring = require('querystring');
var utf8        = require("utf8");

const CLIENT_ID     = 'c778e8173793481c907f2ee677fdf578'; // Your client id
const CLIENT_SECRET = '3d5d8daa997a4b29b11100d55b018ad2'; // Your secret
const REDIRECT_URI  = 'http://localhost:8888/callback'; // Your redirect uri
const SCOPE         = 'playlist-modify'

// request authorization tp access data
module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    get_song_info
}

function get_song_info(track,artirst,access_token){
    var options = {
        url: "https://api.spotify.com/v1/search?q="+track+"&type=track",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };
    
    request.get(options,(error, response, body)=> {
        // console.log(body)
        // res.send(body);
        body.tracks.items.forEach(element => {
            // console.log("!!!",JSON.stringify(body.tracks.items[0]))

            if(element['artists'][0]['name'].toLowerCase() === artirst.toLowerCase()){
                console.log(element.id,element.uri)
            }

        //     }
        });
    })
}