import pprint
import sys
import os
import subprocess
import base64
import spotipy
import spotipy.util as util
#
# idd = '8e18b60279e24176b47fc07f62b79a58'
# sec = '77b157039d304a46926633481274985f'
# web = 'http://www.cnn.com/'
#
#
#
# if len(sys.argv) > 2:
#
#     username = sys.argv[1]
#     playlist_name = sys.argv[2]
# else:
#     print("Usage: %s username playlist-name" % (sys.argv[0],))
#     sys.exit()
# print(1)
# token = util.prompt_for_user_token(client_id =idd,client_secret =sec,redirect_uri =web,username=username,scope= 'playlist-modify')
# print(2)
# if token:
#     sp = spotipy.Spotify(auth=token)
#     sp.trace = False
#     playlists = sp.user_playlist_create(username, playlist_name)
#     temp  = sp.user_playlist
#     pprint.pprint(playlists)
# else:
#     print("Can't get token for", username)

spotify = spotipy.Spotify()
name = "三人游"
results = spotify.search(q = name, type='track')
print(type(results))
for i in results['tracks'].items():

    print(i)
