
// referene from https://developer.spotify.com/web-api/authorization-guide/
// this is build base on the instruction , the flow of 
var express     = require('express'); // Express web server framework
var request     = require('request'); // "Request" library
var querystring = require('querystring');

const CLIENT_ID     = 'c778e8173793481c907f2ee677fdf578'; // Your client id
const CLIENT_SECRET = '3d5d8daa997a4b29b11100d55b018ad2'; // Your secret
const REDIRECT_URI  = 'http://localhost:8888/callback'; // Your redirect uri
const SCOPE         = 'playlist-modify-public playlist-read-collaborative'
const playlist_name = "tmp"
const rp            = require("request-promise");

// in spotify , 戴佩妮 been record as Penny Tai, her song is ony avaliable if I search with offical name, use a dic to stoore this information 
var artist_dic = {}
var reload_time = 300

// request authorization tp access data
module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    get_song_uri,
    get_user_id,
    create_playlist,
    get_playlist_id,
    add_song_to_playlist
}

function get_artist_offical_name(artist,access_token) {
    /***
     * during spotify searching, it is more accurate to get the official name that spotify recorded
     * the search return a new promise with artist offical name 
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q="+encodeURIComponent(artist)+"&type=artist",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    };

    return new Promise((resolve,reject) => {
        rp(options)
        .then((body) => {
            if(body.artists && body.artists.items.length != 0)
                resolve(body.artists.items[0].name);
            else
                reject("Unable to find artirst" + artist);
        }).catch((error) => "error during get_artist_offical_name" + error)
    })
}


function get_song_uri(track,artist,access_token){
    /**
     * get_song_uri : get the uri match to track , which will be used in when add music
     * String  -> String -> String -> Promise
     * => Promise with uri as value
     */
    return new Promise((resolve,reject) => {
        get_artist_offical_name(artist,access_token)
        .then((name) => {
            var options = {
                url: "https://api.spotify.com/v1/search?q="+encodeURIComponent(track)+"&type=track",
                headers: { 'Authorization': 'Bearer ' + access_token},
                json: true
            };
            rp(options)
            .then((body) => {
                if(body.tracks && body.tracks.items) {
                    for(var i = 0; i< body.tracks.items.length; i++) {
                        element = body.tracks.items[i];
                        if(encodeURIComponent(element['artists'][0]['name'].toLowerCase()) === encodeURIComponent(name.toLowerCase())) {
                            resolve(element.uri);
                            break;
                        }
                    }
                }
                reject(`Unable to find data for ${track} ${name}`)
            }).catch((error) => reject("get_song_id Error code " + error.message))
        }).catch(error => reject(error));
    })
}


function get_user_id(access_token) {
    /**
     * get_user_id : return the user id for the user, some user created with facebook may encounter actual useranme does not match with the one they know
     * String -> Promise
     * => Promise with user's id
     */
    var options = {
        url: "https://api.spotify.com/v1/me",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };
      return new Promise((resolve,reject) => {
        rp(options)
        .then((body) => {
            if(body.id)
                resolve(body.id)
            reject("Unable to get user id")
        }).catch((error) => reject("get_user_id Error code " + error.message))
      })
}


function check_playlist(user_id,access_token) {
    /**
     * check_playlist : all the song fetch from xiami will been store in a playlist, which name as tmp, this is just prevent dupliate creation 
     * String -> String -> Promise
     * => Promise with None
     */
    var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };

    return new Promise((resolve,reject) => {
        rp(options)
        .then(res => {
            res.items.forEach(element => {
                if(element.name === playlist_name)
                    resolve();

            });
            reject();
        })
    })
}


function create_playlist(user_id,access_token){
    /**
     * create_playlist : create defualt playlist 
     * String -> String -> Promise
     * => Promise with None
     */
    var options = {
        method : "POST",
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        body: JSON.stringify({
            'name': playlist_name,
            'public': true
        }),
        dataType:'json',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        }
    };

    return new Promise((resolve,reject) => {
        check_playlist(user_id,access_token)
        .then(res => {
            resolve();
        })
        .catch(error => {
            rp(options)
            .then(res =>  resolve())
            .catch((error) => "create_playlist Error code " + error.message);
        })
    })
}


function get_playlist_id(user_id,access_token) {
    /**
     * get_playlist_id : get the playlist id for playlist name 
     * * https://developer.spotify.com/web-api/get-a-list-of-current-users-playlists/
     * @(String , function)
     * => Promise with defualt playlist id
     */
    var options = {
        url: "https://api.spotify.com/v1/users/"+user_id+"/playlists",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    };

    return new Promise((resolve,reject) => {
        rp(options)
        .then((body) => {
            for(var i = 0; i < body.items.length; i++) {
                element = body.items[i];
                if(element.name === playlist_name)
                    resolve(element.id,access_token);
            }
            reject("Unable to find playlist " + playlist_name);
        }).catch((error) => reject("get_playlist_id Error code " + error.message))
    })
}

function add_song_to_playlist(user_id,playlist_id,track_uri,access_token){
    /**
     * add song to playlist
     * String, String ,String ,String , String -> Promise
     * Promise with None
     */
    var options = {
        method : "POST",
        url : "https://api.spotify.com/v1/users/"+user_id+"/playlists/"+playlist_id+"/tracks",
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            uris : [track_uri]
        })
    }
    return new Promise((resolve,reject) => {
        rp(options)
        .then(body => {
            resolve("");
        })
        .catch(error => reject("add_song_to_playlist Error code : " + error));
    })
}

// // get_artist_offical_name("Justin bieber" , "BQClCYXKZ_AUHkiJ-LrR5AH0Qv872VEzz7C0YIxDwL7xwyeJgtoykeVGaQNoDdqTKCZgu5suapI5FydfTgx69UYoQTzh9wEQOSb_um7Fj949hbrkXHl-UeweRfAWRX9FQzxqqfcWwMPlw3dAFBcXAN2vHjwAyE19NbwyCc4pN41W2kN6fw")
// // .then((res) => console.log(res))
// // .catch((err) => console.log(err))

// // get_song_id("Love yourself","Justin bieber" ,"BQClCYXKZ_AUHkiJ-LrR5AH0Qv872VEzz7C0YIxDwL7xwyeJgtoykeVGaQNoDdqTKCZgu5suapI5FydfTgx69UYoQTzh9wEQOSb_um7Fj949hbrkXHl-UeweRfAWRX9FQzxqqfcWwMPlw3dAFBcXAN2vHjwAyE19NbwyCc4pN41W2kN6fw")
// // .then((res)=>{console.log(res)})
// // .catch((error) => {console.log(error)})
// Acc = "BQC9hcqY9FGdeMf8bZVw82a81lpxeIzGE7Xs5_qUT2WAtlcoRtMSb9GlBq0TMkNexVYMLdXI-LpOSJZ5uv0Ji9U15678Vm7var4UITNdFOATSQwA8jeEH8P1wl3I027juYhLnl5qvCfPVw2ZixusbaQC7VKXdt04I_Z5KpXLmCeTISwn9A"
// // // get_user_id("BQDP9o9nmFVzPuSGuIlkYCVttCVnoTgoKUbxEDM3WQZyCUKmIRQugu9Cxd831B0_nlCcKLvWxMhPLGubsMzkmKKAWYgqr4LC-H8KlTNhpjWFobzndYbgvbLvAIqHM2fqK4IMg3FedT5zH-J9BTFInkOaIHZzmQeP0zxKJGN5m8lsuPfA2Q")
// // // .then((res)=>{console.log(res)})
// // create_playlist("zhang435" , Acc).then((acc) => {console.log("good")})
// // .catch((err) => {console.log("fail")})

// get_playlist_id("zhang435",Acc)
// .then((res) => console.log(res))