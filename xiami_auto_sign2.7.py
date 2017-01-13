# -*- coding: utf-8 -*-
'''''
Created on 2012-11-15

@author:
'''
import urllib, urllib2, cookielib, sys,base64,re

class LoginXiami:
    login_header = {'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.79 Safari/537.4'}
    signin_header = {'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31', 'X-Requested-With':'XMLHttpRequest', 'Content-Length':'0', 'Origin':'http://www.xiami.com', 'Referer':'http://www.xiami.com/'}
    email = ''
    password = ''
    cookie = None
    cookieFile = './cookie.dat'

    def __init__(self, email, pwd):
        self.email = email
        self.password = (pwd)
        self.cookie = cookielib.LWPCookieJar()
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookie))
        urllib2.install_opener(opener)

    def login(self):
        postdata = {'email':self.email, 'password':self.password, 'done':'http://www.xiami.com', 'submit':'%E7%99%BB+%E5%BD%95'}
        postdata = urllib.urlencode(postdata)
        print(postdata)
        print('Logining...')
        req = urllib2.Request(url='http://www.xiami.com/member/login', data=postdata, headers=self.login_header)
        result = urllib2.urlopen(req).read()
        self.cookie.save(self.cookieFile)
        result = str(result)

        #.decode('utf-8').encode('gbk')
        if 'Email 或者密码错误' in result:
            print('Login failed due to Email or Password error...')
            sys.exit()
        else :
            print('Login successfully!')

    def fetch(self):
        postdata = {}
        postdata = urllib.urlencode(postdata)
        print('Going to Your favorite')
        page = 1
        song_artist = []
        while 1:

            req = urllib2.Request(url='http://www.xiami.com/space/lib-song/page/'+str(page), data=postdata, headers=self.signin_header)
            content_stream = urllib2.urlopen(req)
            result = content_stream.read()
            if "song_name" not in result or page == 5:
                print("finished fetch all songs in Xiami")
                for i in song_artist:
                    a,b = i
                    print(a)
                    print(b)
                    print()
                break
            print("Currently In page "+str(page))
            musictable = re.findall('(?<=<td class="song_name">).+?(?=</td>)' , result , re.DOTALL)


            for i in musictable:

                song_name   = re.search('(?<=<a title=").+?(?=" hre)' , i , re.DOTALL).group(0)
                song_name = song_name.replace("&#039;","'")

                artist_name = re.search('(?<=<a class="artist_name").+?(?=</a>)' , i , re.DOTALL).group(0)
                artist_name = re.search('(?<=">).+' ,  artist_name , re.DOTALL).group(0)
                artist_name = artist_name.replace("&#039;","'")
                song_artist.append([song_name,artist_name])
            page+=1




if __name__ == '__main__':
    user = LoginXiami('apple19950105@gmail.com', 'apple19950105')
    user.login()
    user.fetch()
