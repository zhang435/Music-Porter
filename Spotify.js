const http  = require("http")
const https = require("https")
const querystring = require("querystring")
const cheerio     = require("cheerio")
const suepragent  = require("superagent")
function login (username, password) {
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
            console.log(id,name,userToken,xiamiToken);
            // 
            suepragent.get(`http://www.xiami.com/space/lib-song/u/18313828/page/1`)
            .set('Cookie', `_xiamitoken=${xiamiToken}`,)
            .end((error,res) => {
                console.log(res)
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

login("apple19950105@gmail.com", "apple19950105")

// function getUserFavoredSongs (id, page = 1) {
//   if (page < 1) throw new Error('Argument `page` must more than or equal to 1')
//   return new Promise((resolve, reject) => {
//       console.log(`http://www.xiami.com/space/lib-song/u/${id}/page/${page}`)
//     http.get(`http://www.xiami.com/space/lib-song/u/${id}/page/${page}/`, (res) => {
//       const { statusCode } = res

//     //   let error
//     //   if (statusCode !== 200) {
//     //     error = new Error(`Request Failed during get songs.\nStatus Code: ${statusCode}`)
//     //   }
//     //   if (error) {
//     //     res.resume()
//     //     reject(error)
//     //     return
//     //   }

//       res.setEncoding('utf8')
//       let rawData = ''
//       res.on('data', (chunk) => { rawData += chunk })
//       console.log(rawData,"1");
//       res.on('end', () => {
//         const $ = cheerio.load(rawData)
//         // const total = parseInt($('.counts').text().match(/\d+/)[0])
//         if (total === 0) {
//           resolve(null)
//           return
//         }

//         const data = []
//         const lastPage = Math.ceil(total / MAX_USER_FAVORED_SONGS_PAGE_ITEMS)
//         if (page > lastPage) {
//           resolve(null)
//           return
//         }

//         resolve({ total, lastPage, page, data })
//       })
//     }).on('error', (e) => {
//       reject(e)
//     })
//   })
// }
// // login("apple19950105@gmail.com","apple19950105")
// // .then((res) => {
// //     console.log(res.id,"!!!")
// //     getUserFavoredSongs(res.id)
// //   })