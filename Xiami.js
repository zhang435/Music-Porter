const http  = require("http")
const https = require("https")
const querystring = require("querystring")
const cheerio     = require("cheerio")
const suepragent  = require("superagent")
// reference from https://github.com/ovo4096/node-xiami-api/blob/master/src/crawler.js
module.exports = {
    get_user_playlist,
    login,
    generate_song_singer
}
function get_user_playlist(username,password,callback){
    login("apple19950105@gmail.com", "apple19950105",callback);
}


function login (username, password,callback) {
    return new Promise((resolve, reject) => {
      https.get('https://login.xiami.com/member/login', (res) => {
        const { statusCode } = res
  
        let error
        if (statusCode !== 200) {
          error = new Error(`Request Failed.\nStatus Code: ${statusCode}`)
        }
  
        const xiamiToken = res.headers['set-cookie'][1].match(/_xiamitoken=(\w+);/)[1]
        res.resume()
  
        const postData = querystring.stringify({
          '_xiamitoken': xiamiToken,
          'account': username,
          'pw': password
        })
        const options = {
          hostname: 'login.xiami.com',
          path: '/passport/login',
          method: 'POST',
          headers: {
            'Referer': 'https://login.xiami.com/member/login',
            'Cookie': `_xiamitoken=${xiamiToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        
        const req = https.request(options, (res) => {
          const { statusCode } = res
        //   console.log(res)  
            
          let error
          if (statusCode !== 200) {
            error = new Error(`Request Failed.\nStatus Code: ${statusCode}`)
          }
          if (error) {
            res.resume()
            reject(error)
          }
  
          res.setEncoding('utf8')
          let rawData = ''
          res.on('data', (chunk) => { rawData += chunk })
          res.on('end', () => {
            const parsedData = JSON.parse(rawData)
            if (!parsedData.status) {
              reject(new Error(parsedData.msg))
              return
            }
  
            const id = parseInt(res.headers['set-cookie'][4].match(/user=(\d+)/)[1])
            const name = decodeURIComponent(res.headers['set-cookie'][4].match(/%22(.*?)%22/)[1])
            const userToken = res.headers['set-cookie'][3].split(" ")[0].replace("member_auth=","").replace(";","")
            // const xiamiToken = res.headers['set-cookie'][1].match(/_xiamitoken=(\w+);/)[1]
            // console.log(id,name,userToken,xiamiToken);
              suepragent.get(`http://www.xiami.com/space/lib-song/u/${id}/page/1`)
              .set('Cookie', `_xiamitoken=${xiamiToken}`,)
              .end((error,res) => {
                  var total = total_page(res);
                  for(var i = 1; i <= total; i++){
                    suepragent.get(`http://www.xiami.com/space/lib-song/u/${id}/page/${i}`)
                    .set('Cookie', `_xiamitoken=${xiamiToken}`,)
                    .end((error,res) => {
                        callback(generate_song_singer(res));
                    })
                  }
              })
            resolve({
              id,
              name,
            })
          })
        })
        req.on('error', (e) => {
          reject(e)
        })
        req.end(postData)
      }).on('error', (e) => {
        reject(e)
      })
    })
  }

function total_page(res){
    /**
     * total_page : return the total page for user_playlist , need to form the for loop
     * String -> int
     */

    var cheerio = require('cheerio'),$ = cheerio.load(res.text);
    console.log("total pages : ",Math.ceil(parseInt($('.all_page').find("span").text().replace("(第1页, 共","").replace("条)",""))/25))
    return Math.ceil(parseInt($('.all_page').find("span").text().replace("(第1页, 共","").replace("条)",""))/25); 
}

function generate_song_singer(res){
    /**
     * generate_song_singer : iteriate the whole userplaylist to get the data from Xiami
     * Stirng -> {song @String : singer @String }
     */
    var song_singers = {};
    var cheerio = require('cheerio'),$ = cheerio.load(res.text);
    $(".song_name").each((i,element) => {
        var song  = $(element).find("a").first().text();
        var singer = $(element).find(".artist_name").text();
        song_singers[song] = singer
    })
    // console.log(song_singers);
    return song_singers;
}


get_user_playlist("apple19950105@gmail.com", "apple19950105",(res)=>{
    console.log(res);
});