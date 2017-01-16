import sys
import spotipy
import spotipy.util as util
idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'
scope = 'user-library-read'


def show_tracks(tracks):
    for i, item in enumerate(tracks['items']):
        track = item['track']
        print "   %d %32.32s %s" % (i, track['artists'][0]['name'],
                                    track['name'])


if __name__ == '__main__':
    if len(sys.argv) > 1:
        username = sys.argv[1]
        if len(sys.argv) > 2:
            username += " " + sys.argv[2]
    else:
        print "Whoops, need your username!"
        print "usage: python user_playlists.py [username]"
        sys.exit()
    token = util.prompt_for_user_token(
        client_id=idd, client_secret=sec, redirect_uri=web, username=username, scope=scope)
    if token:
        sp = spotipy.Spotify(auth=token)
        playlists = sp.user_playlists(username)

        for playlist in playlists['items']:
            print(username, "apple")
            if playlist['owner']['id'] == username:
                print playlist['name']
                print '  total tracks', playlist['tracks']['total']
                results = sp.user_playlist(username, playlist['id'],
                                           fields="tracks,next")
                tracks = results['tracks']
                show_tracks(tracks)
                while tracks['next']:
                    tracks = sp.next(tracks)
                    show_tracks(tracks)
    else:
        print "Can't get token for", username
