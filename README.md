
# From Xiami to Spotify implemented with Node.js


If you have trouble to bring your music from Xiami into Spotify, this should be the application you looking for.
This applicatoin is in purpose of help people to tranfer private palylist from xiami to Spotify. super useful for student who study in US and use Xiami back in mainlnad China
[Start Use Xiami  to Spotify by click this link](https://still-brushlands-47642.herokuapp.com/)

### Introducation
---------
this is a Node.js web app that in purpose of adding songs from [Xiami music application](https://www.xiami.com) to [Spotify](www.spotify.com)

Trace of this can be describe as:
[Spotify access](https://developer.spotify.com/web-api/authorization-guide/) -> [xiami login](http://www.xiami.com/) -> add song page by page into Spotify

### Requirement
---------
knowing your Spotify account
knowing your Xiami   account

**_Warning : I did not implment any error handling, So if somehow you have wrong username/password, it not going to show any valid message, so make sure your password is correct._**



### Rate
---------
Use my own data as reference, I am able to transfer 657/1300 from Xiami to Spotify.
All the songs will be added into a folder named "tmp", you can change it AFTER process finish.
**_Warning: if you change name during the process it mind break the program_**

### Result
----------
one the web page, user will receive some ugly stirng, which has two catgory
1. passed [spotify_track_uri]  | this simply means spotify did find the track
2. failed [message/error problem] | this means spotify is not able to find given track, but if you get "error" in the failed, it means somethign goes wrong with applicatoin, it is 5XX, then it is Spotiify problem, but it is 4XX, please make a issue about this.


On the spotify side, the way to check this tranformation dynamically, use desktop version of Spotify. phone's spotify does not show real tiem result of update, but destop version will.
### Reference
_______
[Spotify API](https://developer.spotify.com/web-api/)
[Xiami access]( https://github.com/ovo4096/node-xiami-api/blob/master/src/crawler.js)
[Node.js](https://nodejs.org/en/)

### Other
feel free to extend the application, indeed ,I would happy if someone can make some css design for the page.
You can make some improvement on search etc..