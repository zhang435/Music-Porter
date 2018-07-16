// referene from https://developer.spotify.com/web-api/authorization-guide/
// this is build base on the instruction , the flow of 
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

const CLIENT_ID = 'c778e8173793481c907f2ee677fdf578'; // Your client id
const CLIENT_SECRET = '3d5d8daa997a4b29b11100d55b018ad2'; // Your secret
const url = "https://still-brushlands-47642.herokuapp.com/"
// const url = "http://localhost:8888/"

const REDIRECT_URI = url + "callback"; // Your redirect uri
const SCOPE = 'playlist-modify-public playlist-read-collaborative playlist-modify-private'
const playlist_name = "tmp"
const rp = require("request-promise");

// in spotify , 戴佩妮 been record as Penny Tai, her song is ony avaliable if I search with offical name, use a dic to stoore this information 
// request authorization tp access data
module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    get_user_id,
    create_playlist,
    get_playlist_id,
    get_songs_uri,
    add,
}

async function get_user_id(access_token) {
    /**
     * get_user_id : return the user id for the user, some user created with facebook may encounter actual useranme does not match with the one they know
     * String -> Promise
     * => Promise with user's id
     */
    var options = {
        url: "https://api.spotify.com/v1/me",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                if (body.id)
                    resolve(body.id)
                reject({
                    messgae: "Unable to get user id"
                })
            }).catch(error => {
                reject({
                    error
                });
            });
    })
}



async function check_playlist(user_id, access_token) {
    /**
     * check_playlist : all the song fetch from xiami will been store in a playlist, which name as tmp, this is just prevent dupliate creation 
     * String -> String -> Promise
     * => Promise with None
     */
    var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        rp(options)
            .then(res => {
                res.items.forEach(element => {
                    if (element.name === playlist_name)
                        resolve(false);
                });
                resolve(true);
            })
    })
}


async function create_playlist(user_id, access_token) {
    /**
     * create_playlist : create defualt playlist 
     * String -> String -> Void
     * => Promise with None
     */
    var options = {
        method: "POST",
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        body: JSON.stringify({
            'name': playlist_name,
            'public': true
        }),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        }
    };
    // resolve it the play not been created, otherwise return reject
    var bool = await check_playlist(user_id, access_token).catch(error => error);
    return new Promise((resolve, reject) => {
        if (bool) {
            rp(options)
                .then(res => resolve())
                .catch(error => {});
        }
        resolve();
    })

}

async function get_playlist_id(user_id, access_token) {
    /**
     * get_playlist_id : get the playlist id for playlist name 
     * * https://developer.spotify.com/web-api/get-a-list-of-current-users-playlists/
     * @(String , function)
     * => Promise with defualt playlist id
     */
    var options = {
        url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                for (var i = 0; i < body.items.length; i++) {
                    element = body.items[i];
                    if (element.name === playlist_name)
                        resolve(element.id);
                }
                reject({
                    message: "Unable to find playlist " + playlist_name
                });
            }).catch(error => {
                error: error
            })
    })
}



// ///// all the function above should be called only once///////////////////////////////////////////////////////

function get_artist_offical_name(artist, access_token) {
    /***
     * during spotify searching, it is more accurate to get the official name that spotify recorded
     * the search return a new promise with artist offical name 
     * String -> String -> Promise
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q=" + encodeURIComponent(artist) + "&type=artist",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((body) => {
                if (body.artists && body.artists.items.length != 0)
                    resolve(body.artists.items[0].name);
                else
                    reject({
                        message: "Unable to find artirst" + artist
                    });
            }).catch(error => {
                reject({
                    error: error.statusCode
                })
            })
    })
}



function get_song_uri(track, artist, access_token) {
    /**
     * get_song_uri : get the uri match to track , which will be used in when add music
     * String  -> String -> String -> Promise
     * => Promise with uri as value
     */
    var options = {
        url: "https://api.spotify.com/v1/search?q=" + encodeURIComponent(track) + "&type=track",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true,
        resolveWithFullResponse: true
    };


    return new Promise((resolve, reject) => {
        rp(options)
            .then((response) => {
                body = response.body;
                if (body.tracks && body.tracks.items) {
                    for (var i = 0; i < body.tracks.items.length; i++) {
                        ele = body.tracks.items[i];
                        if (encodeURIComponent(ele['artists'][0]['name'].toLowerCase()) === encodeURIComponent(artist.toLowerCase())) {
                            resolve(ele.uri);
                        }
                    }
                }
                reject({
                    message: `Unable to find data for ${track} ${artist}`
                })
            }).catch((error) => {
                reject({
                    error: error
                });
            })
    })
}

function print(p) {
    console.log(p);
}

async function get_songs_uri(arr, access_token) {
    /** 
     * get one page of playlist from xiami and and search them one by one to get thespotify tracj uri,
     * typeof uri !== "object" since once the promise been reject, it will return a dict contains with message or eror {error/message: ...}
     * detail to check in get_artist_offical_name/get_song_uri
     * [[String(track),String(artist)] ...] -> Array
     * 
     */
    var passed = [];
    var fail = [];
    for (var i = 0; i < arr.length; i++) {
        element = arr[i];

        var artist = await get_artist_offical_name(element[1], access_token).catch(error => error);

        if (typeof artist !== "object") {
            var uri = await get_song_uri(element[0], artist, access_token).catch(error => error);
            if (typeof uri !== "object") {
                passed.push(uri);
            } else {
                fail.push([element, uri]);
            }
        } else {
            fail.push([element, artist]);
        }
    }
    return {
        passed,
        fail
    }

}

async function add(user_id, playlist_id, arr, access_token) {
    /**
     * get the playlist id and song from xiami on certain pages, then add all of them in to the playlist been created
     * add : String -> arr[spotify uri] -> String -> Void
     */
    var options = {
        method: "POST",
        url: "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/tracks",
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: arr
        })
    }
    rp(options)
        .then(body => {})
        .catch(error => error)
}