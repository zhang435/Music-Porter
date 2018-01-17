import { Promise } from '../../../Library/Caches/typescript/2.6/node_modules/@types/bluebird';


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
    get_song_id,
    get_user_id,
    create_playlist,
    get_playlist_id,
    add
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
        })
    })
    .catch((err) =>{console.log("error during get_artist_offical_name" + err)})
}


function get_song_id(track,artist,access_token){
    return new Promise((resolve,reject) => {
        get_artist_offical_name(artist,access_token)
        .then((name) => {
            console.log(name,"1")
            var options = {
                url: "https://api.spotify.com/v1/search?q="+encodeURIComponent(track)+"&type=track",
                headers: { 'Authorization': 'Bearer ' + access_token},
                json: true
            };

            rp(options)
            .then((body) => {
                // console.log(body)
                if(body.tracks && body.tracks.items) {
                    for(var i = 0; i< body.tracks.items.length; i++) {
                        element = body.tracks.items[i];
                        // console.log(name)
                        if(encodeURIComponent(element['artists'][0]['name'].toLowerCase()) === encodeURIComponent(name.toLowerCase())) {
                            resolve(element.id);
                            break;
                        }
                    }
                    reject(`Unable to find data for ${track} ${name}`)
                }
                reject(`Unable to find data for ${track} ${name}`)
            })
        })
    })
    .catch((err) => {console.log("error during get_song_id : " + err)})
}


function get_user_id(access_token) {
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
        })
      })
}

function create_playlist(user_id,access_token){
    var options = {
        url : "https://api.spotify.com/v1/users/"+user_id+"/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
        json : true
    }
    return new Promise((resolve,reject) => {
        rp(options)
        .then((body) => {
            if(body && body.items){
                var playlists = body.items.map(x => x.name)
            }
            
        })
    })

    

}
// function create_playlist(user_id,access_token,callback){
//     /**
//      * create_playlist : create a playlist if playlistname not exist 
//      * @(String,function)
//      * https://developer.spotify.com/web-api/create-playlist/
//      */
    
//     var options = {
//         url : "https://api.spotify.com/v1/users/"+user_id+"/playlists",
//         headers: {
//             'Authorization': 'Bearer ' + access_token,
//         },
//         json : true
//     }

//     request.get(options,(error,response,body) =>{
//         if(response.statusCode !== 400){
//             var playlists = body.items.map(x => x.name)
//             // check if playlist already exist 
//             if(!playlists.includes(playlist_name)){
//                 var options = {
//                     url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
//                     body: JSON.stringify({
//                         'name': playlist_name,
//                         'public': true
//                     }),
//                     dataType:'json',
//                     headers: {
//                         'Authorization': 'Bearer ' + access_token,
//                         'Content-Type': 'application/json',
//                     }
//                 };
//                 // create playlist if not 
//                 request.post(options,(error,response,body) => {
//                     console.log("playlist created");
//                     callback();
//                 })
//             }else{
//                 callback() 
//             }
//         }

//         })
//     }


function get_playlist_id(access_token,callback){
    /**
     * get_playlist_id : get the playlist id for playlist name 
     * @(String , function)
     * https://developer.spotify.com/web-api/get-a-list-of-current-users-playlists/
     */
    var options = {
        url: "https://api.spotify.com/v1/users/zhang435/playlists",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };
    request.get(options,(error,response,body) => {
        // console.log(Object.keys(response),body);
        if(response.caseless.dict["retry-after"]){
            setTimeout(() => {
                get_playlist_id(access_token,callback)        
            }, response.caseless.dict["retry-after"] * 1500);
        }else{
            for(var i = 0; i < body.items.length; i++) {
                element = body.items[i];
                if(element.name === playlist_name){
                        callback(element.id,access_token)    
                    break;
                }
            }
        }
        
    })
}




function add_song_to_playlist(user_id,playlist_id,track_uri,access_token){
    /**
     * add_song_to_playlist : add song into playlist 
     * @(String, String, Strin, function)
     * add song into playlist 
     */
    var options = {
        url : "https://api.spotify.com/v1/users/"+user_id+"/playlists/"+playlist_id+"/tracks",
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            uris : [track_uri]
        })
    }

    request.post(options,(error,response,body) => {
        if(response.caseless.dict["retry-after"]){
            console.log("waiting to cool down : ",response.caseless.dict["retry-after"])
            setTimeout(() => {
                add_song_to_playlist(user_id,playlist_id,track_uri,access_token)
            }, response.caseless.dict["retry-after"] * 1500);
        }else{
            console.log(body);
        }
        
    })
}

function add(track,artist,user_id,access_token){
    // main function
        get_playlist_id(access_token,(playlist_id,access_token) => {
            get_song_id(track,artist,access_token,(track_id,uri) => {
        
            add_song_to_playlist(user_id,playlist_id,uri,access_token)
                console.log("end");
            })
        })            
}


// get_artist_offical_name("Justin bieber" , "BQClCYXKZ_AUHkiJ-LrR5AH0Qv872VEzz7C0YIxDwL7xwyeJgtoykeVGaQNoDdqTKCZgu5suapI5FydfTgx69UYoQTzh9wEQOSb_um7Fj949hbrkXHl-UeweRfAWRX9FQzxqqfcWwMPlw3dAFBcXAN2vHjwAyE19NbwyCc4pN41W2kN6fw")

// get_song_id("Love yourself","Justin bieber" ,"BQClCYXKZ_AUHkiJ-LrR5AH0Qv872VEzz7C0YIxDwL7xwyeJgtoykeVGaQNoDdqTKCZgu5suapI5FydfTgx69UYoQTzh9wEQOSb_um7Fj949hbrkXHl-UeweRfAWRX9FQzxqqfcWwMPlw3dAFBcXAN2vHjwAyE19NbwyCc4pN41W2kN6fw")
// .then((res)=>{console.log(res)})
// .catch((error) => {console.log(error)})
get_user_id("BQClCYXKZ_AUHkiJ-LrR5AH0Qv872VEzz7C0YIxDwL7xwyeJgtoykeVGaQNoDdqTKCZgu5suapI5FydfTgx69UYoQTzh9wEQOSb_um7Fj949hbrkXHl-UeweRfAWRX9FQzxqqfcWwMPlw3dAFBcXAN2vHjwAyE19NbwyCc4pN41W2kN6fw")
.then((res)=>{console.log(res)})