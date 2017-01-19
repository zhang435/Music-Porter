import time
import sys
print "\x1b[2;34m word\x1b[0m"
for i in range(100):
    sys.stdout.write("\r")
    sys.stdout.write(str(i))
    sys.stdout.flush()
    time.sleep(1)


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

        # for i in range(len(songs)):
        #     if i % 99 == 0:
        #         # refresh the token
        #         self.token = util.prompt_for_user_token(
        #             client_id=self.iD, client_secret=self.sec, redirect_uri=self.web, username=self.username, scope=scope)
        #         sp = spotipy.Spotify(auth=self.token)
        #
        #         sp.user_playlist_add_tracks(self.username, temp, results)
        #         results = []
        #
        #     song = songs[i]
        #     sys.stdout.write("\r")
        #     sys.stdout.write("\x1b[1;36m... In process ..."+str(i)+"/"+str(total)+"\x1b[0m")
        #     sys.stdout.flush()
        #
        #     data = Search_Singers_Song(song[1], song[0])
        #     song = data.get_song_uri()
        #     # the return type of Search_Singers_Song
        #     # (boolan ,song,singer)
        #     # if we did not find the right inforamtion, we still need to record it, to let user know
        #     if song[0]:
        #         results.append(song[2])
        #     else:
        #         error.append(song)
