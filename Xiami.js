const cheerio = require("cheerio")
const suepragent = require("superagent")
const rp = require("request-promise");
const _ = require('lodash');

/**
 * Xiami.js mainly handle the job for user to acess the xiami account and featch the playlist contents
 */

module.exports = {
    Xiami
}

function Xiami(playlistUrl) {
    this._xiami_token;
    this.user_id;
    this.spm_code;

    fetch_xiami_token()
        .then(token => {
            this._xiami_token = token
        })
        .catch(err => {
            console.log("error occur");
            Error("unable to access xiami token")
        });
    infos = extract_url(playlistUrl);
    this.user_id = infos.user_id;
    this.spm_code = infos.spm_code;
    console.log(this.user_id, this.spm_code);


    /**
     * 
     * @param {*} url http url for the user playlist
     */
    function extract_url(url) {
        /**
         * extract user_id,page_num,spm_code from url
         * @param url String : xiami playlist url
         * @returns {user_id String, spm_code String}
         */
        var contents = _.split(url, "/")
        return {
            "user_id": contents[6],
            "spm_code": _.split(contents[8], "spm=")[1]
        }
    }


    /**
     * _include_headers: this method will able rp to return whole http reponse instead of just body content
     * @param {*} html content from request 
     * @param {*} response http response
     * @param {*} resolveWithFullResponse  None
     */
    function _include_headers(body, response, resolveWithFullResponse) {
        return {
            'headers': response.headers,
            'data': body
        };
    };

    /**
     * fetch_xiami_token: send a request to the login page, which will send back a xiami access token for login
     * @returns Promise
     */
    async function fetch_xiami_token() {
        var options = {
            method: 'GET',
            uri: "https://login.xiami.com/member/login",
            transform: _include_headers
        };
        return new Promise((resolve, reject) => {
            rp(options)
                .then((response) => {
                    // console.log(response.headers['set-cookie'], "!!!")
                    resolve(response.headers['set-cookie'][2].match(/_xiamitoken=(\w+);/)[1])
                })
                .catch((error) => {
                    console.log(error);
                    reject("unable to get the page", options.uri)
                })
        });
    }

    /**
     * feach the coeresponding playlist page of user
     * @param {dict} user_info 
     * @param {int} page_num the page num of my playlist
     * @param {String} _xiami_token get access token for the user
     */
    this.fetch_page = async function (page_num) {
        var standard_url = `http://www.xiami.com/space/lib-song/u/${this.user_id}/page/${page_num}`;
        // console.log(standard_url);
        return new Promise((resolve, reject) => {
            suepragent.get(standard_url)
                .set('Cookie', `_xiamitoken=${this._xiami_token}`)
                .end((error, res) => {
                    if (error)
                        reject("unable to load page ", );
                    resolve(res);
                });
        });
    }

    /**
     * extract the sgong singer content from paylist table base on the html content send from the fetch_page
     * @param {html String} content html page
     * @returns {String, String} {song, singer}
     */
    this.generate_song_singer = async function (content) {
        /**
         * generate_song_singer : iteriate the whole userplaylist to get the data from Xiami
         * Stirng -> {song @String : singer @String }
         */
        var song_singers = Array();
        $ = cheerio.load(content.text);
        $(".song_name").each((i, element) => {
            var song = $(element).find("a").first().text();
            var singer = $(element).find(".artist_name").text();
            song_singers.push([song, singer])
        })
        return song_singers;
    }
}

xm = new Xiami("https://www.xiami.com/space/lib-song/u/18313828/page/2?spm=a1z1s.6928797.1561534521.379.Vf6tln");
console.log(xm);