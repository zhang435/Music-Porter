import sys
import spotipy
import pprint
import spotipy.util as util
from Login_Fetch_Xiami import *
from Search_Artists_Song_Spotify import *
idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'
scope = 'user-library-read'

if len(sys.argv) > 1:
    username = sys.argv[1]
else:
    print("Usage: %s username" % (sys.argv[0],))
    sys.exit()

token = util.prompt_for_user_token(
    client_id=idd, client_secret=sec, redirect_uri=web, username=username, scope=scope)

if token:
    sp = spotipy.Spotify(auth=token)
    #
    user = LoginXiami('apple19950105@gmail.com', 'apple19950105')
    user.login()
    songs = user.fetch_faviort()
    results = []
    error = []
    print("start add songs into Spotify default playlist")
    for song in songs:
        data = Search_Singers_Song(song[1], song[0])
        song = data.get_song_uri()

        if song[0]:
            results.append(song[2])
        else:
            error.append(song)

results = sp.user_playlist_add_tracks(
    username, '0Ng9cjSBSwtFhPAXmVpTqw', results)

# results = sp.user_playlist_add_tracks(username, playlist_id, track_ids)
print("*" * 20)
print("complete")
print("*" * 20)
print '\n'
print("below's some are not avaliable in the market, or it using differnt name in Spotify")
for i in error:
    print i[1] + " : " + i[2]
