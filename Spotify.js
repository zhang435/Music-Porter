const rp = require("request-promise");

const CLIENT_ID = "c778e8173793481c907f2ee677fdf578"; // Your client id
const CLIENT_SECRET = "3d5d8daa997a4b29b11100d55b018ad2"; // Your secret
// const url = "https://still-brushlands-47642.herokuapp.com/"
const url = "http://localhost:8888/";

const REDIRECT_URI = url + "callback"; // Your redirect uri
const SCOPE =
    "playlist-modify-public playlist-read-collaborative playlist-modify-private";

module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SCOPE,
    init
};

/**
 * Spotify wrapper object
 *
 * @param {*} accessToken xiami access token
 * @param {*} source playlistName, if the user start from Xiami, source = xiami, or if user come from netEase, the source = NetEase
 * **/

function Spotify(accessToken, source) {
    this.accessToken = accessToken;
    this.playListName = "From " + source;
    this.userID = null;
    this.playListID = null;

    /**
     * get_user_id : return the user id for the user, some user created with facebook may encounter actual useranme does not match with the one they know
     * String -> Promise
     * => Promise with user's id
     */
    this.getUserID = async () => {
        var options = {
            url: "https://api.spotify.com/v1/me",
            headers: {
                Authorization: "Bearer " + this.accessToken
            },
            json: true
        };

        console.debug(this.accessToken, this.playListName);

        return new Promise((resolve, reject) => {
            rp(options)
                .then(body => {
                    // get the user id through API
                    if (body.id) {
                        return resolve({
                            success: true,
                            val: body.id
                        });
                    }

                    return reject({
                        success: false,
                        message: "Unable to get data for" + this.accessToken
                    });
                })
                .catch(error => {
                    return reject({
                        success: false,
                        message: "error when sending the request to getUserID, error : " +
                            error + this.accessToken + "?"
                    });
                });
        });
    };

    /**
     * check_playlist : all the song fetch from xiami will been store in a playlist, which name as tmp, this is just prevent dupliate creation
     * @returns Promise
     */
    this.ifPlayListExists = async () => {
        var options = {
            url: "https://api.spotify.com/v1/users/" + this.userID + "/playlists",
            headers: {
                Authorization: "Bearer " + this.accessToken
            },
            json: true
        };

        return new Promise((resolve, reject) => {
            // if this function been used before userID/accessToekn defined, rej
            if (this.userID === undefined || this.accessToken === undefined) {
                return reject({
                    success: false,
                    message: "userID/accessToken is not initlized yet, code error"
                });
            }

            // go through all playlist, make sure the playlist exists
            rp(options)
                .then(res => {
                    var found = false;
                    if (res.items.map(item => item.name).includes(this.playListName)) {
                        found = true;
                    }

                    return resolve({
                        success: true,
                        val: {
                            found: found,
                            val: res.items.find(pl => pl.name == this.playListName)
                        }
                    });
                })
                .catch(error => {
                    return reject({
                        success: false,
                        message: "error when sending the request to ifPlayListExists, error code: " +
                            error
                    });
                });
        });
    };

    /**
     * check if paltlist already been created or not, if not created, create one and return the id of pl
     * if created before, it will get the id from pl
     * create_playlist : create default playlist with PlayListName
     * => Promise
     */
    this.createPlaylist = async () => {

        var _ = await this.getPlayLists().catch(err => err);
        if (_.success) {
            return new Promise((resolve, reject) => {
                // console.debug(_.val.map(elem => elem.name), _.val.map(elem => elem.name).includes(this.playListName), this.playListName);
                // if the playlist is already been created
                if (_.val.map(elem => elem.name).includes(this.playListName)) {
                    console.debug("playlist already exists " + this.playListName);
                    var res = _.val.find(elem => {
                        // console.debug(elem.name, this.playListName, elem.name == this.playListName)
                        return elem.name == this.playListName
                    });
                    return resolve({
                        success: true,
                        val: res.id
                    });
                } else {
                    // create playlist
                    console.debug("create playlist " + this.playListName);
                    var options = {
                        method: "POST",
                        url: "https://api.spotify.com/v1/users/" + this.userID + "/playlists",
                        body: JSON.stringify({
                            name: this.playListName,
                            public: true
                        }),
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + this.accessToken,
                            "Content-Type": "application/json"
                        }
                    };

                    // send request to API
                    rp(options)
                        .then(res => {
                            res = JSON.parse(res);
                            resolve({
                                "success": true,
                                val: res.id
                            });
                        })
                        .catch(error => {
                            return reject({
                                success: false,
                                message: "error when sending the request to create PlayList, error code: " +
                                    error
                            });
                        });

                }
            });
        } else {
            return new Promise((resolve, reject) => {
                return reject({
                    success: false,
                    "message": _.message
                });
            });
        }
    };

    /**
     * during spotify searching, it is more accurate to get the official name that spotify recorded
     * the search return a new promise with artist offical name
     * String -> String -> Promise
     */
    this.getArtistName = async artist => {
        var options = {
            url: "https://api.spotify.com/v1/search?q=" +
                encodeURIComponent(artist) +
                "&type=artist",
            headers: {
                Authorization: "Bearer " + this.accessToken
            },
            json: true
        };

        // search for the artist
        return new Promise((resolve, reject) => {
            rp(options)
                .then(res => {
                    if (res.artists && res.artists.items.length != 0) {
                        // console.debug("found " + JSON.stringify(res.artists.items[0]))
                        return resolve({
                            success: true,
                            found: true,
                            val: res.artists.items[0].name
                        });
                    }
                    return resolve({
                        success: true,
                        found: false,
                        val: artist
                    });
                })
                .catch(error => {
                    return reject({
                        success: false,
                        message: "error when sending the request to getArtistOfficalName, error: " +
                            error
                    });
                });
        });
    };

    this.getPlayLists = async () => {
        var options = {
            url: "https://api.spotify.com/v1/users/" + this.userID + "/playlists",
            headers: {
                Authorization: "Bearer " + this.accessToken
            },
            json: true
        };

        return new Promise((resolve, reject) => {
            // if this function been used before userID/accessToken defined, rej
            if (this.userID === undefined || this.accessToken === undefined) {
                return reject({
                    success: false,
                    message: "userID/accessToken is not initlized yet, code error"
                });
            }

            // go through all playlist, make sure the playlist exists
            rp(options).then(res => {
                return resolve({
                    success: true,
                    val: res.items
                })
            });
        });
    };

    /**
     * get_song_uri : get the uri match to track , which will be used in when add music
     * String  -> String -> Promise
     * => Promise with uri as value
     */
    this.getSongURI = async (track, artist) => {
        artist = await this.getArtistName(artist).catch(err => err);
        if (!artist.success) {
            return new Promise((resolve, reject) => {
                return reject({
                    success: false,
                    message: artist.message
                });
            });
        }

        if (!artist.found) {
            return new Promise((resolve, reject) => {
                return resolve({
                    success: true,
                    found: false,
                    val: undefined
                })
            });
        }

        artist = artist.val

        var options = {
            url: `https://api.spotify.com/v1/search?q=track${encodeURIComponent(
          ":" + track + " "
        )}artist${encodeURIComponent(":" + artist)}` + "&type=track",
            headers: {
                Authorization: "Bearer " + this.accessToken
            },
            json: true,
            resolveWithFullResponse: true
        };
        // console.log(options.url);

        return new Promise((resolve, reject) => {
            rp(options).then(res => {
                body = res.body;

                // if any of these values are undefined, it means the function is won't return any valid res
                if ([body.tracks, body.tracks.items].includes(undefined)) {
                    return reject({
                        success: false,
                        message: "one of the val for finding SongURI is undefined : " + [body.tracks, body.tracks.items]
                    });
                }

                if (body.tracks.items.length == 0) {
                    return resolve({
                        success: true,
                        found: false,
                        val: undefined
                    });
                    return;
                }

                var uri = body.tracks.items[0].uri;
                return resolve({
                    success: true,
                    found: true,
                    val: uri
                });
            });
        });
    };
    /**
     * @param {*} arr list of song singer
     * called right after
     */
    this.getSongsURI = async arr => {
        var passed = [];
        var fail = [];
        var uris = [];

        for (i in arr) {
            element = arr[i];
            var _ = await this.getSongURI(element[0], element[1]).catch(err => err);
            if (!_.success || !_.found) {
                fail.push(element);
            }

            if (_.success && _.found) {
                passed.push(element);
                uris.push(_.val);
            }
        }

        return new Promise((resolve, reject) => {
            return resolve({
                success: true,
                val: {
                    passed,
                    fail,
                    uris
                }
            });
        });
    };

    /**
     * @param songs list of track uri
     */
    this.addSongsToPlaylist = async (songs) => {

        if (songs.length == 0) {
            return new Promise((resolve, reject) => {
                resolve({
                    success: true,
                    val: null
                })
            });

        }

        var options = {
            method: "POST",
            url: "https://api.spotify.com/v1/users/" +
                this.userID +
                "/playlists/" +
                this.playListID +
                "/tracks",
            headers: {
                Authorization: "Bearer " + this.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: songs
            })
        };
        return new Promise((resolve, reject) => {
            rp(options).then(body => {
                if (body.statusCode / 500 >= 1) {
                    return reject({
                        success: false,
                        message: "encounter error when add songs to playlist : " + songs
                    });
                } else {
                    return resolve({
                        success: true,
                        val: null
                    });
                }
            }).catch(err => {
                console.debug(err.message);
                return reject({
                    success: false,
                    message: "encounter error when add songs to playlist : " + err
                });
            });
        });
    };

    /**
     * __init__ function for Spotify
     * outter class should only use this method
     */
}

async function init(accessToken, source) {

    sp = new Spotify(accessToken, source);
    console.debug(accessToken);
    var _ = await sp.getUserID().catch(err => err);
    if (!_.success) {
        return new Promise((resolve, reject) => {
            reject({
                success: false,
                message: _.message
            })
        });
    }

    console.debug("got userID " + JSON.stringify(_));

    if (_.success) {
        sp.userID = _.val;
    } else {
        return new Promise((resolve, reject) => {
            return reject({
                success: false,
                message: _.message
            });
        });
    }

    var _ = await sp.createPlaylist().catch(err => err);
    console.debug("got playListID" + JSON.stringify(_));
    if (_.success) {
        sp.playListID = _.val;
    } else {
        console.debug(_.message);
    }

    return new Promise((resolve, reject) => {
        return resolve({
            success: true,
            val: sp
        });
    });
}

// accessToken =
//     "BQAQCxsa8Ve0W4qzZX_x4Gq9fwed3r2emSZilWeTY17Ipncab4kEZKIWAQ5T33hnP_vzmYbtpWl_wxwysEmDVdsPjo1r64b3ovMt2r4ByyNFGGKoruW4ij5IDrjGZT3RWEUXfVwM5dmIfjGd6E5cfPAxXBLcu2F4VqcUbNG7liOY000N2GvnaNylP5ouwdk--v6OElHWMsUsaA";

// // var obj = init(accessToken, "tmp").then(res => {
// //   console.debug(res);
// // });

// (async () => {
//     var sp = await init(accessToken, "test1");
//     console.log(sp);
//     if (sp.success) {
//         sp = sp.val;
//     } else {
//         return;
//     }
//     songs_artist = [
//         ["十年", "陈奕迅"],
//         ["God's Plan", "Drake"]
//         // ["kdjsfksjdfn", "陈奕迅"],
//         // ["pressure", "RL Grime"]
//     ];
//     var name = await sp.getArtistName(songs_artist[1]).catch(err => err);
//     if (name.success) {
//         name = name.val;
//     } else {
//         console.debug(name.message);
//         return;
//     }

//     console.debug(name);


//     var uris = await sp.getSongsURI(songs_artist).catch(err => err);
//     if (uris.success) {
//         console.debug(uris.val);

//     } else {
//         console.debug(uris.message);
//     }

//     var _ = await sp.addSongsToPlaylist(uris.val.uris).catch(err => err);
//     if (_.success) {
//         console.debug("done");
//     } else {
//         console.debug(_.message);
//     }


// })();