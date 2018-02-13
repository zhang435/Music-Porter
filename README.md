# transform music form xiami to spotify implemented with nodejs
## pretty close to finish up everything , if you want to use it now, you can change my xiami password hardcode inside the main.js then you can use it


this is a "web app" that in purpose of transfer music from Xiami Playlist to Spotify
This is really useful for whoever study abroad and would like to integrate music into Spotify.

###Introducation
    this is a Node.js that in purpose of adding songs from [Xiami music application](https://www.xiami.com) to [Spotify](www.spotify.com)

    Trace of this can be describe as:
        Xiami Login -> (FOR ALL i `(total pages in xiami playlist)` Xiami song fetch at ith page -> SPotify API access -> create palylist -> add ith songs fetch from Xiami to playlist)

    Use my own data as reference, I am able to transfer 657/1300 from Xiami to Spotify.
    All the songs will be added into a folder named "tmp", you can change it after process finish.

###Requirement
    knowing your Spotify account
    knowing your Xiami   account


###Reference
    [Spotify API](https://developer.spotify.com/web-api/)
    [Xiami access]( https://github.com/ovo4096/node-xiami-api/blob/master/src/crawler.js)
    [Node.js](https://nodejs.org/en/)

### Improvement
    There are many things we can do to improve the transfer rate. song tracks just not exist in SPotify, there is nothing we can do about it, while, there are songs like
    SONGNAME (Live) by XXX => wont find it unless we remove (Live)
    SONGNAME by XXX & XXX => we can find the song if we only search one artist
    Some chinese singer store in spotify with their Cantonese name, which may able to find by replace from simplifed to trditional
    
    Feel free to change/improve this!