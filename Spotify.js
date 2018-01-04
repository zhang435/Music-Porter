// referene from https://developer.spotify.com/web-api/authorization-guide/
// this is build base on the instruction , the flow of 
var express     = require('express'); // Express web server framework
var request     = require('request'); // "Request" library
var querystring = require('querystring');
var utf8        = require("utf8");

const CLIENT_ID     = 'c778e8173793481c907f2ee677fdf578'; // Your client id
const CLIENT_SECRET = '3d5d8daa997a4b29b11100d55b018ad2'; // Your secret
const REDIRECT_URI  = 'http://localhost:8888/callback'; // Your redirect uri
const SCOPE         = 'playlist-modify-public'

// request authorization tp access data
module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    get_song_info,
    get_user_id,
    create_playlist,
    get_playlist_id,
    add
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

function get_user_id(access_token,callback){
    var options = {
        url: "https://api.spotify.com/v1/me",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };   
    
      request.get(options,(error,response,body) => {
        callback(body.id,access_token);
      });
}

function create_playlist(user_id,access_token){
    var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        body: JSON.stringify({
            'name': "From_Xiami",
            'public': true
        }),
        dataType:'json',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        }
    }; 
    
      request.post(options,(error,response,body) => {
          console.log("playlist created");
      })
    }

function get_playlist_id(access_token,callback){
    var options = {
        url: "https://api.spotify.com/v1/users/zhang435/playlists",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };
    request.get(options,(error,response,body) => {
        body.items.forEach(element => {
            if(element.name === "From_Xiami"){
                callback(element.id,access_token)
                return;
            }
        });
        
    })
}


function add_song_to_playlist(user_id,playlist_id,track_id,access_token){
    console.log("I am in",user_id,playlist_id,track_id)
    var options = {
        url : "https://api.spotify.com/v1/users/"+user_id+"/playlists/"+playlist_id+"/tracks",
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            uris : ["spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"]
        })
    }

    // request.post(options,(error,response,body) => {
    //     console.log(body);
    // })
}

function add(access_token){
    create_playlist("zhang435",access_token);
    get_user_id(access_token,(user_id,access_token) => {
    get_playlist_id(access_token,(playlist_id,access_token) => {
        // console.log(user_id,playlist_id)
    add_song_to_playlist(user_id,playlist_id,"spotify:track:4V6MRo0CEAC9MwAm7dkPuL",access_token)
    console.log("end");
    })
    })
}