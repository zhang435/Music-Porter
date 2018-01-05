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
function get_artist_offical_name(artist,access_token,callback){

    if(artist_dic[artist]){
        callback(artist_dic[artist])
    }else{
        var options = {
            url: "https://api.spotify.com/v1/search?q="+encodeURIComponent(artist)+"&type=artist",
            headers: { 'Authorization': 'Bearer ' + access_token},
            json: true
          };
    
        request.get(options,(error,response,body) => {
            if(body.artists && body.artists.items.length != 0){
                artist_dic[artist] = body.artists.items[0].name;
                artist             = body.artists.items[0].name;
            }
                callback(artist);    
        });
    }
}

function get_song_id(track,artist,access_token,callback){
    /**
     * get_song_id : get the track id base on track astrist 
     * para @{String, String , String ,function}
     * https://developer.spotify.com/web-api/search-item/
     */
    get_artist_offical_name(artist,access_token,(name) => {
        console.log("official name" , name);
        var options = {
            url: "https://api.spotify.com/v1/search?q="+encodeURIComponent(track)+"&type=track",
            headers: { 'Authorization': 'Bearer ' + access_token},
            json: true
          };
        
        request.get(options,(error, response, body)=> {
            // console.log(body.tracks)
            if(response.statusCode !== 400 && body.tracks){
                for(var i = 0; i< body.tracks.items.length; i++){
                    element = body.tracks.items[i];
                    if(encodeURIComponent(element['artists'][0]['name'].toLowerCase()) === encodeURIComponent(name.toLowerCase())){
                            callback(element.id,element.uri)    
                        break;
                    }
                }
            }
        })
    })

}

function get_user_id(access_token,callback){
    /**
     * get_user_id : get username of current user
     * @(String,function)
     * https://developer.spotify.com/web-api/get-current-users-profile/
     */
    var options = {
        url: "https://api.spotify.com/v1/me",
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
      };   
    
      request.get(options,(error,response,body) => {
        callback(body.id);
      });
}

function create_playlist(user_id,access_token,callback){
    /**
     * create_playlist : create a playlist if playlistname not exist 
     * @(String,function)
     * https://developer.spotify.com/web-api/create-playlist/
     */
    
    var options = {
        url : "https://api.spotify.com/v1/users/"+user_id+"/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
        json : true
    }

    request.get(options,(error,response,body) =>{
        if(response.statusCode !== 400){
            var playlists = body.items.map(x => x.name)
            // check if playlist already exist 
            if(!playlists.includes(playlist_name)){
                var options = {
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
                // create playlist if not 
                request.post(options,(error,response,body) => {
                    console.log("playlist created");
                    callback();
                })
            }else{
                callback() 
            }
        }

        })
    }


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