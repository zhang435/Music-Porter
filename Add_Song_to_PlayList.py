import sys
import spotipy
import pprint
import spotipy.util as util
idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'
scope = 'user-library-read'
#
#
# if len(sys.argv) > 3:
#     username = sys.argv[1]
#     playlist_id = sys.argv[2]
#     track_ids = sys.argv[3:]
# else:
#     print("Usage: %s username playlist_id track_id ..." % (sys.argv[0],))
#     sys.exit()
#
# scope = 'playlist-modify-public'
# token = util.prompt_for_user_token(username, scope)
#
# if token:
#     sp = spotipy.Spotify(auth=token)
#     sp.trace = False
#     results = sp.user_playlist_add_tracks(username, playlist_id, track_ids)
#     print(results)
# else:
#     print("Can't get token for", username)


if len(sys.argv) > 1:
    username = sys.argv[1]
else:
    print("Usage: %s username" % (sys.argv[0],))
    sys.exit()

scope = ''
token = util.prompt_for_user_token(
    client_id=idd, client_secret=sec, redirect_uri=web, username=username, scope=scope)

if token:
    sp = spotipy.Spotify(auth=token)
    results = sp.user_playlist_add_tracks(
        username, '0Ng9cjSBSwtFhPAXmVpTqw', '55qBw1900pZKfXJ6Q9A2Lc')
    playlists = sp.user_playlists(username)
    for i in playlists['items']:
        print(i['name'], i['id'])
