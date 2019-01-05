const cheerio = require("cheerio");
const suepragent = require("superagent");
const rp = require("request-promise");
const _ = require("lodash");

/**
 * Xiami.js mainly handle the job for user to acess the xiami account and featch the playlist contents
 */

module.exports = {
  init
};

function Xiami(playlistUrl) {
  this.xiamiToken;
  this.userID;
  this.spmCode;
  /**
   *
   * @param {*} url http url for the user playlist
   */

  this.extractUrl = async url => {
    /**
     * extract userID,page_num,spmCode from url
     * @param url String : xiami playlist url
     * @returns {userID String, spmCode String}
     */
    var contents = _.split(url, "/");
    return new Promise((resolve, reject) => {
      resolve({
        success: true,
        val: {
          userID: contents[6],
          spmCode: _.split(contents[8], "spm=")[1]
        }
      });
    });
  };

  /**
   * _include_headers: this method will able rp to return whole http response instead of just body content
   * @param {*} html content from request
   * @param {*} response http response
   * @param {*} resolveWithFullResponse  None
   */
  function _include_headers(body, response, resolveWithFullResponse) {
    return {
      headers: response.headers,
      data: body
    };
  }

  /**
   * fetchXiamiToken: send a request to the login page, which will send back a xiami access token for login
   * @returns Promise
   */
  this.fetchXiamiToken = async () => {
    var options = {
      method: "GET",
      uri: "https://login.xiami.com/member/login",
      transform: _include_headers
    };

    return new Promise((resolve, reject) => {
      rp(options)
        .then(response => {
          // console.log(response.headers['set-cookie'], "!!!")
          resolve({
            success: true,
            val: response.headers["set-cookie"][2].match(
              /_xiamitoken=(\w+);/
            )[1]
          });
        })
        .catch(error => {
          reject({
            success: false,
            message: "unable to access the page : " + options.uri
          });
        });
    });
  };

  /**
   * feach the coeresponding playlist page of user
   * @param {dict} user_info
   * @param {int} page_num the page num of my playlist
   * @param {String} xiamiToken get access token for the user
   */

  this.fetchPage = async (page_num) => {
    var standard_url = `http://www.xiami.com/space/lib-song/u/${
      this.userID
    }/page/${page_num}`;
    // console.log(standard_url);
    return new Promise((resolve, reject) => {
      suepragent
        .get(standard_url)
        .set("Cookie", `_xiamitoken=${this.xiamiToken}`)
        .end((error, res) => {
          if (error) {
            reject({
              success: false,
              message: "unable to load page " + standard_url
            });
          } else {
            resolve({
              success: true,
              val: res
            });
          }
        });
    });
  }

  /**
   * extract the sgong singer content from paylist table base on the html content send from the fetchPage
   * @param {html String} content html page
   * @returns {String, String} {song, singer}
   */
  this.generateSongSinger = async function (content) {
    /**
     * generate_song_singer : iteriate the whole userplaylist to get the data from Xiami
     * Stirng -> {song @String : singer @String }
     */
    var song_singers = Array();
    $ = cheerio.load(content.text);
    $(".song_name").each((i, element) => {
      var song = $(element)
        .find("a")
        .first()
        .text();
      var singer = $(element)
        .find(".artist_name")
        .text();
      song_singers.push([song, singer]);
    });
    return new Promise((resolve, reject) => {
      resolve({
        "success": true,
        "val": song_singers
      })
    });
  };
}

async function init(url) {
  var xm = new Xiami(url);
  var _ = await xm.fetchXiamiToken().catch(err => err);

  if (_.success) {
    xm.xiamiToken = _.val;
  } else {
    return new Promise((resolve, reject) => {
      reject({
        success: false,
        message: _
      });
    });
  }

  var _ = await xm.extractUrl(url).then(err => err);
  if (_.success) {
    xm.userID = _.val.userID;
    xm.spmCode = _.val.spmCode;
  } else {
    return new Promise((resolve, reject) => {
      reject({
        success: false,
        message: _
      });
    });
  }

  return new Promise((resolve, reject) => {
    resolve({
      success: true,
      val: xm
    });
  });
};

// var url =
//   "https://www.xiami.com/space/lib-song/u/18313828/page/2?spm=a1z1s.6928797.1561534521.379.Vf6tln";
// var x = init(url)
//   .then(res => {
//     res.val.fetchPage(40).then(x => {

//     }).catch(err => {
//       console.log(err);
//     })
//   })
//   .catch();

// (async () => {
//   var xm = await init(url).catch(err => err);
//   if (!xm.success) {
//     console.log(xm.err);
//     return;
//   } else {
//     xm = xm.val;

//   }

//   var page = await xm.fetchPage(20).catch(err => err);
//   if (!page.success) {
//     console.log(page.message);
//     return;
//   } else {
//     page = page.val;
//   }

//   // console.log(page);

//   var song_singers = await xm.generateSongSinger(page);
//   console.log(song_singers.val);
// })();