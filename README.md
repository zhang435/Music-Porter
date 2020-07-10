# Xiami & Netease update their frontend and parser is not working. Close this project. 

# Music Porter

### From Xiami/NetEaseCloudMusic to Spotify implemented with Node.js

![](https://upload-images.jianshu.io/upload_images/4457561-ef588ad60e2dae00.png)

If you have trouble migrate music from Xiami/NetEaseCloudMusic to Spotify,
this is the application you looking for!!

[Start Use Xiami/NetEaseCloudMusic to Spotify by click this link](https://still-brushlands-47642.herokuapp.com/)

### Introduction

---

[Spotify access](https://developer.spotify.com/web-api/authorization-guide/) -> [xiami login](http://www.xiami.com/) -> add song page by page into Spotify

[Spotify access](https://developer.spotify.com/web-api/authorization-guide/) -> [NetEase playListUrl]() -> add all songs into playlist at once

[Video tutorial](https://youtu.be/gtFL4aW6IWc)

### Requirement

---

Spotify Username & Password
**_for Xiami_**
Url of second page of your xiami PlayList

**_for NetEaseCloudMusic_**
playlist url

**_Note : if you got error "请输入验证码"， please wait for an hour or so until validatoin end for you account_**

### Rate

---

Use my own data as reference, I am able to transfer 657/1300 from Xiami to Spotify.
All the songs will be added into a folder named "tmp", you can change it AFTER process finish.
**_Warning: if you change name during the process it mind break the program_**

For **_NetEaseCloudMusic_**, it will not show the realtime update due to design issue.
It will show songs in spotify all at once, which means you have to wait approximatly (1 second \* total song) until it shows

### Result

---

one the web page, user will receive some ugly stirng, which has two catgory

1. passed [spotify_track_uri] | this simply means spotify did find the track
2. failed [message/error problem] | this means spotify is not able to find given track, but if you get "error" in the failed, it means somethign goes wrong with applicatoin, it is 5XX, then it is Spotiify problem, but it is 4XX, please make a issue about this.

On the spotify side, the way to check this tranformation dynamically, use desktop version of Spotify. phone's spotify does not show real tiem result of update, but destop version will.

### Reference

---

[Spotify API](https://developer.spotify.com/web-api/)

[Xiami access](https://github.com/ovo4096/node-xiami-api/blob/master/src/crawler.js)

[Node.js](https://nodejs.org/en/)

### Other

feel free to extend the application, indeed ,I would happy if someone can make some css design for the page.
You can make some improvement on (improve)search etc..
