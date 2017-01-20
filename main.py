import sys
import spotipy
import pprint
import spotipy.util as util
from Login_Fetch_Xiami import *
from Search_Artists_Song_Spotify import *

web  ='http://github.com/zhang435/Xiami_To_Spotify/'
scope = 'playlist-modify'

class Xiami_to_Spotify(object):
    def __init__(self,xiami_email,xiami_password,username,iD,sec, web = web):
        self.iD = iD
        self.sec= sec
        self.web  =web

        self.xiami_email = xiami_email
        self.xiami_password = xiami_password
        self.username = username
        self.token = util.prompt_for_user_token(
            client_id=iD, client_secret=sec, redirect_uri=web, username=username, scope=scope)

    def start(self):
        user= LoginXiami(self.xiami_email,self.xiami_password)
        user.login()
        while not self.token:
            print("\033[91mWrong information, Please change it and call function again\033[0m")
            sys.exit()
        sp = spotipy.Spotify(auth=self.token)

        # user = LoginXiami('apple19950105@gmail.com', 'apple19950105')
        songs = user.fetch_faviort()
        songs , total  = songs[0],songs[1]
        results = []
        error = []


        # add the music into defualt playlsit
        # we call From_Xiami
        playlists = sp.user_playlists(self.username)
        tag = True
        temp  = None
        for playlist in playlists['items']:
            if "From_Xiami" == playlist['name']:
                tag = False
                temp = playlist['id']
                break

        if tag:
            print("\x1b[1;32mCreate 'From_Xiami' in your playlist\x1b[0m")
            sp.user_playlist_create(self.username, "From_Xiami")
            playlists = sp.user_playlists(self.username)
            for playlist in playlists['items']:
                if "From_Xiami" == playlist['name']:
                    temp = playlist['id']
                    break
            # print(playlist['id'], playlist['name'])
        # print(temp,songs)
        print("\x1b[1;32mStart add songs into Spotify default playlist\x1b[0m")
        count = 0
        for song in songs:
                # sp = spotipy.Spotify(auth=self.token)
            count+=1
            sys.stdout.write("\r")
            sys.stdout.write("\x1b[1;36m... In process ..."+str(count)+"/"+str(total)+"\x1b[0m")
            sys.stdout.flush()

            data = Search_Singers_Song(song[1], song[0])
            song = data.get_song_uri()
            # the return type of Search_Singers_Song
            # (boolan ,song,singer)
            # if we did not find the right inforamtion, we still need to record it, to let user know
            if song[0]:
                results.append(song[2])
            else:
                error.append(song)
            if count%10 == 0:
                self.token = util.prompt_for_user_token(
                    client_id=self.iD, client_secret=self.sec, redirect_uri=self.web, username=self.username, scope=scope)
                if results:
                    sp.user_playlist_add_tracks(self.username, temp, results)
                    results = []

        print("\033[94m...Waiting...\033[0m")
        results = sp.user_playlist_add_tracks(self.username, temp, results)
        print('\x1b[6;20;43m Success!\x1b[0m')


        print("\033[91mbelow's some are not avaliable in the market, or it using differnt name in Spotify")

        print("*" * 30+"*" * 30+"\n")
        print(str(len(error))+ "in total\033[0m")
        for i in error:
            print i[1] + " : " + i[2]
        # results = sp.user_playlist_add_tracks(self.username, '0Ng9cjSBSwtFhPAXmVpTqw', results)
        print("\033[91m"+"*" * 30+"*" * 30+"\n"+"\033[0m")

if __name__ == '__main__':
    #move = Xiami_to_Spotify('Xiami_Username','Xiami_password','Spotify_useranem',client_id,client_scert)
    move.start()
