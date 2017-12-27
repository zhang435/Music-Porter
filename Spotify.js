const http  = require("http")
const https = require("https")
const querystring = require("querystring")
const cheerio     = require("cheerio")
const suepragent  = require("superagent")
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
            // 
            suepragent.get(`http://www.xiami.com/space/lib-song/u/${id}/page/1`)
            .set('Cookie', `_xiamitoken=${xiamiToken}`,)
            .end((error,res) => {
                callback(res)
            })
            resolve({
              id,
              name,

            //   userToken
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

login("apple19950105@gmail.com", "apple19950105", (res) => {
  
})


function form_Data(res,callback){
  var song_names   = get_songnames(res);
  var song_singers = get_artists(res);
  console.log(song_names);
  console.log(song_singers);
  callback({songnames,song_singers});
}

function get_songnames(res){
  var songname = res.text.match(/<td class="song_name">[\s\S]*?<\/td>/g)
  song_name = []
  songname.forEach(element => {
      var tmp = element.match(/<a title="(.*?)"/g)
      tmp = tmp
      .toString()
      .replace("<a title=","")
      tmp =  tmp.replace("\"","")
      song_name.push(tmp.slice(0,tmp.length-1));
  });
  return songname;
}

function get_artists(res){
  var singers = res.text.match(/<a class="artist_name"[\s\S]*?<\/a>/g))
  song_singers = []
  singers.forEach(element => {
    var tmp = element.match(/title="(.*?)"/g)
    tmp = tmp.toString().replace("title=","")
    tmp = tmp.replace("\"","")
    song_singers.push(tmp.slice(0,tmp.length-1));
  });
  return song_singers;
}