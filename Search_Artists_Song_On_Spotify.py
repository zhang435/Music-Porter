# encoding: utf-8
import sys
import os
import base64
import spotipy
import spotipy.util as util
from utf8_trans import to_utf8, isEnglish
# encoding: utf-8
# -*- coding: utf-8 -*-
# this function is im purose to find the specific artist's song
# specially spend time to deal with tranfer chinese to to uncoide and
# search , change the uncoide backinto chinese


idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'

sp = spotipy.Spotify()


class Search_Singers_Song(object):

    def __init__(self, singer, song):
        self.singer = singer
        self.song = song

    def get_song_uri(self):
        global sp
        if not isEnglish(self.song):
            self.song = to_utf8(self.song)
        results = sp.search(q='track:' + self.song, type='track')
        items = results["tracks"]["items"]

        for item in items:
            print(item['artists'][0]['name'].encode(
                'utf8', 'ignore').lower(), self.singer.lower())
            if item['artists'][0]['name'].encode('utf8', 'ignore').lower() == self.singer.lower():
                return (item['uri'], item['id'])
        return False
# a = Search_Singers_Song("李代沫", "疼爱")
# print(a.get_song_uri())
b = Search_Singers_Song("katy perry", "teenage Dream")
print(b.get_song_uri())
# eror ketty perry will ot work since the singer is katy perry
