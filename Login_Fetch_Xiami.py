# -*- coding: utf-8 -*-
'''''
Created on 2017-12-29

@author: Jiawei Zhang
'''
import urllib
import urllib2
import cookielib
import sys
import base64
import re
from utf8_trans import to_utf8
import spotipy


class LoginXiami:
    login_header = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.79 Safari/537.4'}
    signin_header = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31',
                     'X-Requested-With': 'XMLHttpRequest', 'Content-Length': '0', 'Origin': 'http://www.xiami.com', 'Referer': 'http://www.xiami.com/'}
    cookie = None
    cookieFile = './cookie.dat'

    def __init__(self, email, pwd):
        self.email = email
        self.password = (pwd)
        self.cookie = cookielib.LWPCookieJar()
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookie))
        urllib2.install_opener(opener)
    # Login
    def login(self):
        postdata = {'email': self.email, 'password': self.password,
                    'done': 'http://www.xiami.com', 'submit': '%E7%99%BB+%E5%BD%95'}

        postdata = urllib.urlencode(postdata)
        # print(postdata)
        print('Logining...')
        req = urllib2.Request(url='http://www.xiami.com/member/login', data=postdata, headers=self.login_header)
        # read the html code from the web page
        result = urllib2.urlopen(req).read()
        # add it into cookie
        self.cookie.save(self.cookieFile)
        result = str(result)
        if '密码错误' in result:
            print('\033[91mLogin failed due to Email or Password error...\033[0m')
            sys.exit()
            return True
        else:
            print('\033[92mLogin successfully!\033[0m')
            return False
    # get the data from html
    # you can turn_off print statment, this may accel the speed of whole process
    # xxx.fetch_faviort(prin = False)

    def fetch_faviort(self,prin = True):
        postdata = {}
        postdata = urllib.urlencode(postdata)
        print('\033[94mVisiting your current Faviort\033[0m')
        page = 1
        song_artist = []
        total_music = 0
        while 1:
            # go to website
            req = urllib2.Request(url='http://www.xiami.com/space/lib-song/page/' +str(page),data=postdata, headers=self.signin_header)

            content_stream = urllib2.urlopen(req)
            result = content_stream.read()
            if 'class="artist_name"' not in result:
                print('\x1b[1;32m'+'#' * 20 + '#' * 20)
                print('#' * 20 + '#' * 20+"\x1b[1;0m")

                print("\x1b[1;36mfinish fetching all music in Xiami\nNow start add musics into Spotify\x1b[1;0m")
                print str(total_music),"in total"
                print('\x1b[1;32m#' * 20 + '#' * 20)
                print('#' * 20 + '#' * 20+"\x1b[0m")
                return [song_artist,total_music]
            if prin:
                print('\x1b[1;36m#' * 20 + '#' * 20)
                print("Currently In page " + str(page))
                print('#' * 20 + '#' * 20+"\x1b[1;0m")

            musictable = re.findall('(?<=<td class="song_name">).+?(?=</td>)', result, re.DOTALL)
            total_music += len(musictable)
            for i in musictable:
                # get the information from the html base on differnt tag
                song_name = re.search('(?<=<a title=").+?(?=" hre)', i, re.DOTALL).group(0)
                song_name = song_name.replace("&#039;", "'")

                #########################

                artist_name = re.search('(?<=<a class="artist_name").+?(?=</a>)', i, re.DOTALL).group(0)
                artist_name = re.search('(?<=">).+',  artist_name, re.DOTALL).group(0)
                artist_name = artist_name.replace("&#039;", "'")
                # improve the searching og both song name and artist name
                if ' (Live)' in song_name:
                    song_name = song_name.replace(" (Live)","")
                sp = spotipy.Spotify()
                result = sp.search(q='artist:' + to_utf8(artist_name), type='artist')
                if  result['artists']['items']:
                    artist_name = result['artists']['items'][0]['name']
                print to_utf8(song_name),
                print ' :', to_utf8(artist_name)
                song_artist.append([to_utf8(song_name), to_utf8(artist_name)])
            page += 1
    def fetch_by_playlist(self):
        # http://www.xiami.com/space/collect/u/18313828
        # under deverlopemnt
        # this function is not necessary for me, but I know some people want
        # enable user to move music base on the playlist but not just add all of them into one playlist
        pass

if __name__ == '__main__':
    # user = LoginXiami(Xiami_Username, Xiami_password)
    user.login()
    ans = user.fetch_faviort()
