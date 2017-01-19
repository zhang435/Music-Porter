import sys
import spotipy
import pprint
import spotipy.util as util
idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'
scope = 'user-library-read'
username = 'zhang435'
token = util.prompt_for_user_token(
    client_id=idd, client_secret=sec, redirect_uri=web, username=username, scope=scope)
sp = spotipy.Spotify(auth=token)

def ifdefautplaylistexist(default = "From_Xiami")
playlists = sp.user_playlists(username)
for playlist in playlists['items']:
    print(playlist['id'], playlist['name'])

 # results = sp.user_playlist_add_tracks(username, playlist_id, track_ids)
